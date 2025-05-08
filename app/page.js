'use client'
import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Select, Input } from "antd";
import styles from "./page.module.css";
import dynamic from 'next/dynamic';
import NewSubscriptionForm from "./components/NewSubscriptionForm";
import CurrentSubscriptionTable from "./components/CurrentSubscriptionTable";

const TablePanel = dynamic(() => import('./components/TablePanel'), { ssr: false });

export default function Home() {
  // 第一排和第二排按钮配置
  const FirstRow = [
    { key: "info", label: "信息流" },
    { key: "my", label: "我的订阅" },
  ];
  // 新增来源按钮单独处理
  let SecondRow, addBtn;
  const [selectedFirst, setSelectedFirst] = useState("info");
  const [selectedSecond, setSelectedSecond] = useState("news");
  const [modalOpen, setModalOpen] = useState(false);

  if (selectedFirst === 'my') {
    SecondRow = [
      { key: 'new', label: '新订阅' },
      { key: 'current', label: '当前订阅' },
      { key: 'addTwitterScope', label: '新增Twitter数据范围' },
    ];
    addBtn = { key: 'add', label: '新增来源 +' };
  } else {
    SecondRow = [
      { key: "news", label: "快讯" },
      { key: "notice", label: "公告" },
      { key: "twitter", label: "twitter" },
    ];
    addBtn = { key: "add", label: "新增来源 +" };
  }

  // 切换我的订阅时，selectedSecond默认选中新订阅
  useEffect(() => {
    if (selectedFirst === 'my') {
      setSelectedSecond('new');
    }
  }, [selectedFirst]);

  return (
    <div className={styles.pagePadding}>
      <div className={styles.buttonPanel}>
        <div className={styles.buttonRow}>
          {FirstRow.map(btn => (
            <Button
              key={btn.key}
              className={
                selectedFirst === btn.key
                  ? `${styles.customBtn} ${styles.selected}`
                  : styles.customBtn
              }
              onClick={() => setSelectedFirst(btn.key)}
            >
              {btn.label}
            </Button>
          ))}
        </div>
        <div className={styles.buttonRowSmallWithAdd}>
          <div className={styles.buttonRowSmallLeft}>
            {SecondRow.map(btn => (
              <Button
                key={btn.key}
                className={
                  selectedSecond === btn.key
                    ? `${styles.smallBtn} ${styles.selected}`
                    : styles.smallBtn
                }
                onClick={() => setSelectedSecond(btn.key)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
          {selectedFirst === 'info' && (
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
      {selectedFirst === 'my' && selectedSecond === 'new' ? (
        <NewSubscriptionForm />
      ) : selectedFirst === 'my' && selectedSecond === 'current' ? (
        <CurrentSubscriptionTable />
      ) : (
        <TablePanel selectedSecond={selectedSecond} />
      )}
      <div className={styles.bottomTip}>
        当前的数据获取是固定的范围，如果需要更多媒体/交易所/Twitter作者，请
        <a
          href="https://example.com/form" // TODO: 替换为实际表单链接
          className={styles.tipLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          填写表单
        </a>
      </div>
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
        className={styles.addSourceModal}
        title={<div className={styles.addSourceTitle}>新增来源申请</div>}
      >
        <Form layout="vertical">
          <Form.Item
            label={<span>类型 <span className={styles.typeTips}>快讯、公告、Twitter、其他</span></span>}
            name="type"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择" options={[
              { value: 'news', label: '快讯' },
              { value: 'notice', label: '公告' },
              { value: 'twitter', label: 'Twitter' },
              { value: 'other', label: '其他' },
            ]} />
          </Form.Item>
          <Form.Item
            label="申请内容"
            name="desc"
            rules={[{ required: true, message: '请填写申请内容' }]}
          >
            <Input.TextArea rows={4} placeholder="其他原因补充" />
          </Form.Item>
          <div className={styles.addSourceBtns}>
            <Button type="primary" htmlType="submit" className={styles.addSourceSubmit}>提交</Button>
            <Button onClick={() => setModalOpen(false)} className={styles.addSourceCancel}>取消</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
