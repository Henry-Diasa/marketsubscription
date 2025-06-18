"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Modal, Form, Select, Input, message, Radio } from "antd";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import NewSubscriptionForm from "./components/NewSubscriptionForm/NewSubscriptionForm";
import CurrentSubscriptionTable from "./components/CurrentSubscriptionTable/CurrentSubscriptionTable";
import LarkLoginButton from "./components/LarkLoginButton";
import { addDataSource, getToken } from "./lib/api";
import { useLanguage } from "./context/LanguageContext";
import { useTranslation } from "./hooks/useTranslation";
const TablePanel = dynamic(() => import("./components/TablePanel/TablePanel"), {
  ssr: false,
});

export default function Home() {
  const [selectedFirst, setSelectedFirst] = useState("info");
  const [selectedSecond, setSelectedSecond] = useState("1");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [subId, setSubId] = useState("");
  const tablePanelRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const isAuthenticatedRef = useRef(false);
  const { currentLang, setCurrentLang } = useLanguage();
  const t = useTranslation(currentLang);
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mk_token") || "";
    }
    return "";
  });
  const [code, setCode] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("code") || "";
    }
    return "";
  });
  const [isAuthenticating, setIsAuthenticating] = useState(code ? true : false);
  if (code && token) {
    isAuthenticatedRef.current = true;
  }
  // 第一排和第二排按钮配置
  const FirstRow = [
    { key: "info", label: t("firstButton.info") },
    { key: "my", label: t("firstButton.my") },
  ];

  // 新增来源按钮单独处理
  let SecondRow, addBtn;
  if (selectedFirst === "my") {
    SecondRow = [
      {
        key: "new",
        label: subId ? t("secondButton.edit") : t("secondButton.new"),
      },
      { key: "current", label: t("secondButton.current") },
    ];
  } else {
    SecondRow = [
      { key: "1", label: t("secondButton.k") },
      { key: "4", label: t("secondButton.news") },
      { key: "2", label: t("secondButton.announcement") },
      { key: "3", label: t("secondButton.twitter") },
    ];
    addBtn = { key: "add", label: t("addButton.add") };
  }
  useEffect(() => {
    document.title = t("meta.title");
  }, [currentLang]);
  // 切换我的订阅时，selectedSecond默认选中新订阅
  useEffect(() => {
    if (selectedFirst === "my") {
      setSelectedSecond("new");
    } else {
      setSelectedSecond("1");
    }
  }, [selectedFirst]);

  useEffect(() => {
    if (code) {
      const token = localStorage.getItem("mk_token");
      setToken(token);

      if (!token) {
        const formData = new FormData();
        formData.append("code", code);
        getToken(formData)
          .then((res) => {
            if (res?.data?.token) {
              localStorage.setItem("mk_token", res.data.token);
              setToken(res.data.token);
              isAuthenticatedRef.current = true;
            } else if (res.code === 400) {
              isAuthenticatedRef.current = false;
              setIsAuthenticating(false);
            }
          })
          .catch(() => {
            isAuthenticatedRef.current = false;
            setIsAuthenticating(false);
          });
      } else {
        setIsAuthenticating(false);
      }
    } else if (!code) {
      localStorage.removeItem("mk_token");
    }
  }, [code]);

  const handleSubmitDataSource = async (values) => {
    const formData = new FormData();
    formData.append("type", values.type);
    formData.append("apply_content", values.apply_content);
    setModalLoading(true);
    const response = await addDataSource(formData);
    if (response.code === 200) {
      messageApi.success(t("message.submitSuccess"));
      setModalOpen(false);
    } else {
      messageApi.error(t("message.submitFail"));
    }
    setModalLoading(false);
  };

  const handleEdit = useCallback((record) => {
    setSubId(record.subId);
    setSelectedSecond("new");
  }, []);
  const handleLanguageChange = (e) => {
    setCurrentLang(e.target.value);
  };
  if (!isAuthenticatedRef.current && !isAuthenticating) {
    return <LarkLoginButton />;
  }

  return (
    <>
      {contextHolder}
      <div className={styles.pagePadding}>
        <div className={styles.buttonPanel}>
          <div className={styles.buttonRow}>
            {FirstRow.map((btn) => (
              <Button
                key={btn.key}
                className={
                  selectedFirst === btn.key
                    ? `${styles.customBtn} ${styles.selected}`
                    : styles.customBtn
                }
                onClick={() => {
                  setSelectedFirst(btn.key);
                  setSubId("");
                }}
              >
                {btn.label}
              </Button>
            ))}
            <Radio.Group
              className={styles.languageRadio}
              value={currentLang}
              onChange={handleLanguageChange}
            >
              <Radio.Button value="zh">zh</Radio.Button>
              <Radio.Button value="en">en</Radio.Button>
            </Radio.Group>
          </div>
          <div className={styles.buttonRowSmallWithAdd}>
            <div className={styles.buttonRowSmallLeft}>
              {SecondRow.map((btn) => (
                <Button
                  key={btn.key}
                  className={
                    selectedSecond === btn.key
                      ? `${styles.smallBtn} ${styles.selected}`
                      : styles.smallBtn
                  }
                  onClick={() => {
                    setSelectedSecond(btn.key);
                    if (btn.key === "current") {
                      setSubId("");
                    }
                  }}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
            {selectedFirst === "info" && (
              <div className={styles.buttonRowSmallAdd}>
                <Button
                  key={addBtn.key}
                  className={styles.smallBtn}
                  onClick={() => setModalOpen(true)}
                >
                  {addBtn.label}
                </Button>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: selectedFirst === "my" ? "none" : "block" }}>
          <TablePanel
            ref={tablePanelRef}
            selectedSecond={selectedFirst === "my" ? "" : selectedSecond}
            token={token}
          />
        </div>
        {selectedFirst === "my" && selectedSecond === "new" && (
          <NewSubscriptionForm
            tablePanelRef={tablePanelRef}
            subId={subId}
            handleAddSuccess={() => {
              setSelectedSecond("current");
              setSubId("");
            }}
          />
        )}
        {selectedFirst === "my" && selectedSecond === "current" && (
          <CurrentSubscriptionTable handleEdit={handleEdit} />
        )}

        {selectedFirst === "info" && selectedSecond !== "3" && (
          <div className={styles.bottomTip}>
            {t("table1.tips21")}
            <a
              onClick={() => setModalOpen(true)}
              className={styles.tipLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("table1.tips22")}
            </a>
          </div>
        )}
        {selectedSecond === "3" && (
          <div className={styles.bottomTip}>
            {t("table1.tips11")}
            <a
              onClick={() => {
                tablePanelRef.current.handleAddDataScope();
              }}
              className={styles.tipLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("table1.tips12")}
            </a>
          </div>
        )}
        {/* 新增来源 弹框 */}
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          centered
          className={styles.addSourceModal}
          title={
            <div className={styles.addSourceTitle}>{t("modal1.title")}</div>
          }
        >
          <Form layout="vertical" onFinish={handleSubmitDataSource}>
            <Form.Item
              label={<span>{t("modal1.label1")}</span>}
              name="type"
              rules={[{ required: true, message: t("modal1.error1") }]}
            >
              <Select
                placeholder={t("modal1.place1")}
                options={[
                  { value: "1", label: t("secondButton.k") },
                  { value: "3", label: t("secondButton.news") },
                  { value: "2", label: t("secondButton.announcement") },
                  { value: "4", label: t("secondButton.other") },
                ]}
              />
            </Form.Item>
            <Form.Item
              label={t("modal1.label2")}
              name="apply_content"
              rules={[
                { required: true, message: t("modal1.error2") },
                {
                  max: 300,
                  message: t("modal1.error3"),
                },
              ]}
            >
              <Input.TextArea rows={4} placeholder={t("modal1.place2")} />
            </Form.Item>
            <div className={styles.addSourceBtns}>
              <Button
                type="primary"
                htmlType="submit"
                loading={modalLoading}
                className={styles.addSourceSubmit}
              >
                {t("modal1.button1")}
              </Button>
              <Button
                onClick={() => setModalOpen(false)}
                className={styles.addSourceCancel}
              >
                {t("modal1.button2")}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </>
  );
}
