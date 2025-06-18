/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-08 15:45:07
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-06-18 17:36:36
 * @FilePath: /marketsubscription/app/components/NewSubscriptionForm.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from "react";
import {
  Form,
  Select,
  Input,
  Button,
  message,
  Spin,
  Popconfirm,
  Divider,
} from "antd";
import {
  addSubscription,
  updateSubscription,
  getSubInfo,
  deleteSubKeyword,
  editSubKeyword,
  addSubKeyword,
} from "../../lib/api";
import styles from "./NewSubscriptionForm.module.css";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";

export default function NewSubscriptionForm({
  handleAddSuccess,
  subId,
  tablePanelRef,
}) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(1);
  const [webhook, setWebhook] = useState("");
  const [sourceKeywords, setSourceKeywords] = useState([]);
  const [keywords, setKeywords] = useState([{ types: [], value: "", id: "" }]);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const { currentLang } = useLanguage();
  const t = useTranslation(currentLang);
  const keywordTypeOptionsMap = {
    1: [
      { value: 0, label: t("new.all") },
      { value: 1, label: t("new.key1") },
      { value: 2, label: t("new.key2") },
      { value: 3, label: t("new.key3") },
      { value: 6, label: t("new.key4") },
    ],
    2: [
      { value: 0, label: t("new.all") },
      { value: 1, label: t("new.key1") },
      { value: 2, label: t("new.key2") },
      { value: 4, label: t("new.key5") },
      { value: 6, label: t("new.key4") },
    ],
    3: [
      { value: 0, label: t("new.all") },
      { value: 2, label: t("new.key2") },
      { value: 5, label: t("new.key6") },
      { value: 6, label: t("new.key4") },
    ],
    4: [
      { value: 0, label: t("new.all") },
      { value: 1, label: t("new.key1") },
      { value: 2, label: t("new.key2") },
      { value: 3, label: t("new.key3") },
      { value: 6, label: t("new.key4") },
    ],
  };
  const keywordTypeOptions = keywordTypeOptionsMap[Number(type)];

  const typeOptions = [
    { value: 1, label: t("new.type1") },
    { value: 2, label: t("new.type2") },
    { value: 3, label: t("new.type3") },
    { value: 4, label: t("new.type4") },
  ];
  useEffect(() => {
    if (subId) {
      handleGetSubInfo();
    }
  }, [subId]);
  const handleGetSubInfo = async () => {
    // 编辑
    const formData = new FormData();
    formData.append("subId", subId);
    setLoading(true);
    const response = await getSubInfo(formData);
    setLoading(false);
    const { subscription_type: type, webhook_url: webhook } =
      response.data.subInfo;
    let keywordList = response.data.keywordList;
    keywordList = keywordList.map((item) => ({
      types: item.keyword_scope.split(",").map(Number),
      value: item.keyword,
      id: item.id,
    }));
    setType(type);
    setWebhook(webhook);
    setKeywords(keywordList);
    setSourceKeywords(keywordList);
    form.setFieldsValue({ type: Number(type) });
    form.setFieldsValue({ webhook });
    form.setFieldsValue({ keywords: keywordList });
  };
  const handleKeywordTypeChange = (types, idx) => {
    if (types[types.length - 1] === 0) {
      types = [0];
    } else {
      types = types.filter((item) => item !== 0);
    }
    form.setFieldsValue({
      keywords: form
        .getFieldsValue()
        .keywords.map((item, i) => (i === idx ? { ...item, types } : item)),
    });
    // setKeywords(prev => prev.map((item, i) => i === idx ? { ...item, types } : item));
  };
  const handleKeywordValueChange = (e, idx) => {
    setKeywords((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, value: e.target.value } : item
      )
    );
  };
  const handleAddKeyword = () => {
    if (keywords.length < 10) {
      setKeywords((prev) => [...prev, { types: [], value: "" }]);
    } else {
      messageApi.error(t("new.max"));
    }
  };
  const handleRemoveKeyword = async (idx) => {
    const formValues = form.getFieldsValue();
    const id = formValues.keywords[idx].id;

    if (id) {
      const formData = new FormData();
      formData.append("subId", subId);
      formData.append("keywordId", id);
      setLoading(true);
      const response = await deleteSubKeyword(formData);
      if (response.code === 200) {
        messageApi.success(t("message.deleteSuccess"));
        form.setFieldsValue({
          keywords: form.getFieldsValue().keywords.filter((_, i) => i !== idx),
        });
      } else {
        messageApi.error(t("message.deleteFail"));
      }
      setLoading(false);
    } else {
      form.setFieldsValue({
        keywords: form.getFieldsValue().keywords.filter((_, i) => i !== idx),
      });
    }
  };

  const handleFinish = async ({ type, webhook, keywords }) => {
    let data = {
      subType: type,
      webHookUrl: webhook,
      keywords: keywords.map((item) => ({
        keywordType: item.types.join(","),
        keyword: item.value,
      })),
    };
    setLoading(true);
    // 处理关键词的新增和编辑
    const newKeywords = keywords
      .filter((item) => !item.id)
      .map((item) => ({
        keywordType: item.types.join(","),
        keyword: item.value,
      }));

    const modifiedKeywords = keywords
      .filter((item) => item.id)
      .filter((item) => {
        const sourceItem = sourceKeywords.find(
          (source) => source.id === item.id
        );
        return (
          sourceItem &&
          (sourceItem.types.join(",") !== item.types.join(",") ||
            sourceItem.value !== item.value)
        );
      })
      .map((item) => ({
        keywordType: item.types.join(","),
        keyword: item.value,
        id: item.id,
      }));

    // 更新订阅
    if (subId) {
      data = {
        ...data,
        subId,
      };
      const updateKeys = [...newKeywords, ...modifiedKeywords];
      try {
        const promises = updateKeys.map(async (item) => {
          try {
            const formData = new FormData();
            formData.append("subId", subId);
            if (item.id) {
              formData.append("keywordId", item.id);
            }
            formData.append("keyword_scope", item.keywordType);
            formData.append("keyword", item.keyword);

            const response = item.id
              ? await editSubKeyword(formData)
              : await addSubKeyword(formData);

            if (response.code !== 200) {
              throw new Error(
                item.id ? t("message.uptKeyFail") : t("message.addKeyFail")
              );
            }
            return response;
          } catch (error) {
            messageApi.error(`${item.keyword}: ${error.message}`);
            return null;
          }
        });

        await Promise.all(promises);
      } catch (error) {
        messageApi.error(t("message.handleKeyFail"));
        setLoading(false);
        return;
      }
    }
    const formData = new FormData();
    formData.append("subId", subId);
    formData.append("webHookUrl", webhook);
    const response = subId
      ? await updateSubscription(formData)
      : await addSubscription(data);
    if (response.code === 200) {
      messageApi.success(
        subId ? t("message.uptSuccess") : t("message.subSuccess")
      );
      handleAddSuccess();
    } else {
      messageApi.error(subId ? t("message.uptFail") : t("message.subFail"));
    }
    setLoading(false);
  };

  return (
    <>
      {contextHolder}
      <div className={`${styles.formWrapper}`}>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="horizontal"
            initialValues={{ type, webhook, keywords }}
            onFinish={handleFinish}
          >
            <Form.Item label={t("new.type")} name="type">
              <Select
                disabled={subId}
                options={typeOptions}
                value={type}
                className={styles.typeSelect}
                onChange={setType}
              />
            </Form.Item>

            <div className={styles.keywordsBlock}>
              <Form.List
                name="keywords"
                initialValue={[{ types: [], value: "", id: "" }]}
              >
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <>
                        <div className={styles.keywordsRow} key={key}>
                          <Form.Item
                            label={index === 0 ? t("new.keyword") : ""}
                            {...restField}
                            name={[name, "types"]}
                            rules={[
                              { required: true, message: t("new.place1") },
                            ]}
                          >
                            <Select
                              maxTagCount="responsive"
                              mode="multiple"
                              allowClear
                              options={keywordTypeOptions}
                              className={styles.keywordTypeSelect}
                              onChange={(types) =>
                                handleKeywordTypeChange(types, index)
                              }
                              placeholder={t("new.place1")}
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "value"]}
                            rules={[
                              { required: true, message: t("new.place2") },
                            ]}
                          >
                            <Input
                              className={styles.keywordInput}
                              placeholder={t("new.place2")}
                              onChange={(e) =>
                                handleKeywordValueChange(e, index)
                              }
                              addonBefore={
                                keywords[index]?.types?.includes("username")
                                  ? "@"
                                  : null
                              }
                            />
                          </Form.Item>

                          {fields.length > 1 && (
                            <Popconfirm
                              title={t("modal2.confirmt")}
                              onConfirm={() => {
                                const formValues = form.getFieldsValue();
                                const id = formValues.keywords[index].id; // 从表单值中获取 id

                                if (id) {
                                  handleRemoveKeyword(index);
                                } else {
                                  remove(name);
                                }
                              }}
                              okText={t("modal2.confirm")}
                              cancelText={t("modal2.cancel")}
                            >
                              <span
                                className={styles.plus}
                                style={{ cursor: "pointer" }}
                              >
                                -
                              </span>
                            </Popconfirm>
                          )}
                        </div>
                        {fields.length > 1 && index !== fields.length - 1 && (
                          <div className={styles.or}>or</div>
                        )}
                      </>
                    ))}
                  </>
                )}
              </Form.List>
            </div>
            <div style={{ paddingLeft: "120px", width: "620px" }}>
              <Divider>
                <span
                  className={styles.plus}
                  onClick={() => {
                    const formValues = form.getFieldsValue();
                    const keywords = formValues.keywords;
                    if (keywords.length < 10) {
                      form.setFieldsValue({
                        keywords: [
                          ...keywords,
                          { types: [], value: "", id: "" },
                        ],
                      });
                    } else {
                      messageApi.error(t("new.max"));
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  +
                </span>
              </Divider>
            </div>
            <div className={styles.keywordLabelRow}>
              <span>{t("new.tips1")}</span>
            </div>
            <div className={styles.webhookRow}>
              <Form.Item
                label={t("new.hook")}
                name="webhook"
                className={styles.webhookItem}
                rules={[
                  {
                    required: true,
                    message: t("new.error1"),
                  },
                  {
                    pattern: /^https:\/\/open.larksuite.com\/open-apis\/bot.+$/,
                    message: t("new.error2"),
                  },
                ]}
              >
                <Input.TextArea rows={2} className={styles.webhookInput} />
              </Form.Item>
              <div className={styles.botTip}>
                <a
                  className={styles.botTipA}
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://open.larksuite.com/document/client-docs/bot-v3/add-custom-bot"
                >
                  {t("new.how")}
                </a>
              </div>

              {type === 3 && (
                <div className={styles.botTip}>
                  {t("table1.tips11")}
                  <a
                    className={styles.botTipA}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => tablePanelRef.current.handleAddDataScope()}
                  >
                    {t("table1.tips12")}
                  </a>
                </div>
              )}
            </div>
            <div className={styles.formBtns}>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.submitBtn}
              >
                {t("modal2.confirm")}
              </Button>
              <Button
                className={styles.cancelBtn}
                onClick={() => handleAddSuccess()}
              >
                {t("modal2.cancel")}
              </Button>
            </div>
          </Form>
        </Spin>
      </div>
    </>
  );
}
