"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Modal, Form, Select, Input, message, Table } from "antd";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import NewSubscriptionForm from "./components/NewSubscriptionForm/NewSubscriptionForm";
import CurrentSubscriptionTable from "./components/CurrentSubscriptionTable/CurrentSubscriptionTable";
import LarkLoginButton from "./components/LarkLoginButton";
import { addDataSource, getToken } from "./lib/api";
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
    { key: "info", label: "信息流" },
    { key: "my", label: "我的订阅" },
  ];

  // 新增来源按钮单独处理
  let SecondRow, addBtn;
  if (selectedFirst === "my") {
    SecondRow = [
      { key: "new", label: subId ? "编辑订阅" : "新订阅" },
      { key: "current", label: "当前订阅" },
    ];
  } else {
    SecondRow = [
      { key: "1", label: "快讯" },
      { key: "4", label: "新闻" },
      { key: "2", label: "公告" },
      { key: "3", label: "twitter" },
    ];
    addBtn = { key: "add", label: "申请新增来源 +" };
  }

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
            } else if(res.code === 400) {
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
      messageApi.success("提交成功");
      setModalOpen(false);
    } else {
      messageApi.error("提交失败");
    }
    setModalLoading(false);
  };

  const handleEdit = useCallback((record) => {
    setSubId(record.subId);
    setSelectedSecond("new");
  }, []);
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
            selectedSecond={selectedFirst === "my" ? '' : selectedSecond}
            token={token}
          />
        </div>
        {selectedFirst === "my" && selectedSecond === "new" && (
          <NewSubscriptionForm
            tablePanelRef={tablePanelRef}
            subId={subId}
            handleAddSuccess={() => {
              setSelectedSecond("current")
              setSubId("")
            }}
          />
        )}
        {selectedFirst === "my" && selectedSecond === "current" && (
          <CurrentSubscriptionTable handleEdit={handleEdit} />
        )}

        {selectedFirst === "info" && selectedSecond !== "3" && (
          <div className={styles.bottomTip}>
            目前的数据获取是固定的范围，如果需要更多媒体/交易所，请
            <a
              onClick={() => setModalOpen(true)}
              className={styles.tipLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              填写表单
            </a>
          </div>
        )}
        {selectedSecond === "3" && <div className={styles.bottomTip}>
          目前的Twitter数据获取是固定的范围，如果需要更多数据，请
          <a
            onClick={() => {
              tablePanelRef.current.handleAddDataScope();
            }}
            className={styles.tipLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            添加数据范围
          </a>
        </div>}
        {/* 新增来源 弹框 */}
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          centered
          className={styles.addSourceModal}
          title={<div className={styles.addSourceTitle}>新增来源申请</div>}
        >
          <Form layout="vertical" onFinish={handleSubmitDataSource}>
            <Form.Item
              label={<span>类型</span>}
              name="type"
              rules={[{ required: true, message: "请选择类型" }]}
            >
              <Select
                placeholder="请选择"
                options={[
                  { value: "1", label: "快讯" },
                  { value: "3", label: "新闻" },
                  { value: "2", label: "公告" },
                  { value: "4", label: "其他" },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="申请内容"
              name="apply_content"
              rules={[{ required: true, message: "请填写申请内容" }]}
            >
              <Input.TextArea rows={4} placeholder="其他原因补充" />
            </Form.Item>
            <div className={styles.addSourceBtns}>
              <Button
                type="primary"
                htmlType="submit"
                loading={modalLoading}
                className={styles.addSourceSubmit}
              >
                提交
              </Button>
              <Button
                onClick={() => setModalOpen(false)}
                className={styles.addSourceCancel}
              >
                取消
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </>
  );
}
