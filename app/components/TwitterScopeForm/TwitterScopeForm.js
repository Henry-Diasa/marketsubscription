/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-12 16:43:05
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-06-19 16:05:21
 * @FilePath: /marketsubscription/app/components/TwitterScopeForm.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useRef } from "react";
import { Select, Input, message, Button, Spin, Popconfirm } from "antd";
import {
  deleteTwitterScope,
  addTwitterScope,
  checkTwitterScope,
} from "../../lib/api";
import styles from "../NewSubscriptionForm/NewSubscriptionForm.module.css";
import stylePage from "./TwitterScopeForm.module.css";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
const typeOptions = [{ value: "1", label: "twitter_id" }];

export default function TwitterScopeForm({ handleCancel }) {
  const [loading, setLoading] = useState(false);
  const [sourceScopes, setSourceScopes] = useState([]);
  const { currentLang } = useLanguage();
  const t = useTranslation(currentLang);
  const [scopes, setScopes] = useState([{ type: "1", value: "" }]);
  const validationErrorsRef = useRef({});
  const [validationErrors, setValidationErrors] = useState({});
  const [messageApi, contextHolder] = message.useMessage();

  const handleTypeChange = (type, idx) => {
    setScopes((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, type } : item))
    );
  };

  const handleValueChange = (e, idx) => {
    setScopes((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, value: e.target.value } : item
      )
    );
    // Clear validation error when user types
    const newErrors = { ...validationErrorsRef.current };
    delete newErrors[idx];
    validationErrorsRef.current = newErrors;
    setValidationErrors(newErrors);
  };

  const checkDuplicate = async (item, idx) => {
    if (!item.value) {
      const newErrors = {
        ...validationErrorsRef.current,
        [idx]: t("modal2.err1"),
      };
      validationErrorsRef.current = newErrors;
      setValidationErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("value", item.value);
    formData.append("type", item.type);
    try {
      const res = await checkTwitterScope(formData);
      if (res.code === 200) {
        const newErrors = {
          ...validationErrorsRef.current,
          [idx]: res.data ? t("message.twitterIdExist") : null,
        };
        validationErrorsRef.current = newErrors;
        setValidationErrors(newErrors);
      }
    } catch (error) {
      console.error("Error checking duplicate:", error);
    }
  };

  const handleAddScope = () => {
    if (scopes.length < 10) {
      setScopes((prev) => [...prev, { type: "1", value: "" }]);
    } else {
      messageApi.error(t("new.max"));
    }
  };

  const handleRemoveScope = async (idx) => {
    const id = scopes[idx].id;
    if (id) {
      const formData = new FormData();
      formData.append("dataId", id);
      setLoading(true);
      const response = await deleteTwitterScope(formData);
      if (response.code === 200) {
        messageApi.success(t("message.deleteSuccess"));
        setScopes((prev) => prev.filter((_, i) => i !== idx));
      } else {
        messageApi.error(t("message.deleteFail"));
      }
      setLoading(false);
    } else {
      const newErrors = { ...validationErrorsRef.current };
      delete newErrors[idx];
      validationErrorsRef.current = newErrors;
      setValidationErrors(newErrors);
      setScopes((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  // 保存
  const handleSave = async () => {
    try {
      // 先进行所有重复检查
      const checkPromises = scopes.map((item, idx) =>
        checkDuplicate(item, idx)
      );
      await Promise.all(checkPromises);

      // 使用 ref 中的最新值进行检查
      if (Object.values(validationErrorsRef.current).some((error) => error)) {
        messageApi.error(t("message.checkFail"));
        return;
      }

      setLoading(true);
      const formData = new FormData();
      scopes.forEach((scope, index) => {
        formData.append(`data[${index}][type]`, scope.type);
        formData.append(`data[${index}][value]`, scope.value);
      });
      const res = await addTwitterScope(formData);
      if (res.code === 200) {
        messageApi.success(t("message.addSuccess"));
        handleCancel();
      } else {
        messageApi.error(t("message.addFail"));
      }
    } catch (error) {
      messageApi.error(t("message.addFail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <div
        className={styles.keywordsBlock}
        style={{ height: "200px", marginTop: 0, overflowY: "auto" }}
      >
        <Spin spinning={loading}>
          {scopes.map((item, idx) => (
            <div
              className={`${styles.keywordsRow} ${stylePage.noPdl}`}
              key={idx}
              style={{ alignItems: "flex-start" }}
            >
              <Select
                options={typeOptions}
                value={item.type}
                className={styles.keywordTypeSelect}
                onChange={(type) => handleTypeChange(type, idx)}
                style={{ width: 120 }}
              />
              <div
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <Input
                  className={styles.keywordInput}
                  value={item.value}
                  onChange={(e) => handleValueChange(e, idx)}
                  onBlur={() => checkDuplicate(item, idx)}
                  addonBefore={item.type === "1" ? "@" : null}
                />
                {validationErrors[idx] && (
                  <div
                    style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
                  >
                    {validationErrors[idx]}
                  </div>
                )}
              </div>
              {idx === 0 ? (
                <span
                  className={styles.plus}
                  onClick={handleAddScope}
                  style={{ cursor: "pointer" }}
                >
                  +
                </span>
              ) : (
                <Popconfirm
                  title={t("modal2.confirmt")}
                  onConfirm={() => handleRemoveScope(idx)}
                  okText={t("modal2.confirm")}
                  cancelText={t("modal2.cancel")}
                >
                  <span className={styles.plus} style={{ cursor: "pointer" }}>
                    -
                  </span>
                </Popconfirm>
              )}
            </div>
          ))}
        </Spin>
      </div>
      <div
        className={styles.botTip}
        style={{ textAlign: "center", padding: 0 }}
      >
        {t("modal2.tips")}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 12,
          justifyContent: "center",
        }}
      >
        <Button
          type="primary"
          disabled={
            loading || Object.values(validationErrors).some((error) => error)
          }
          onClick={handleSave}
        >
          {t("modal1.button1")}
        </Button>
        <Button
          onClick={() => {
            handleCancel();
          }}
        >
          {t("modal1.button2")}
        </Button>
      </div>
    </div>
  );
}
