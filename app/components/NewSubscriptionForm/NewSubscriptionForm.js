/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-08 15:45:07
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-05-13 17:45:00
 * @FilePath: /marketsubscription/app/components/NewSubscriptionForm.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from "react";
import { Form, Select, Input, Button, message, Spin } from "antd";
import { addSubscription, getSubInfo } from "../../lib/api";
import styles from "./NewSubscriptionForm.module.css";



const keywordTypeOptionsMap = {
  1: [
    { value: 'all', label: '全部' },
    { value: 'title', label: '标题' },
    { value: 'content', label: '内容' },
    { value: 'media', label: '媒体' },
    { value: 'link', label: '链接' },
  ],
  2: [
    { value: 'all', label: '全部' },
    { value: 'title', label: '标题' },
    { value: 'content', label: '内容' },
    { value: 'exchange', label: '交易所' },
    { value: 'link', label: '链接' },
  ],
  3: [
    { value: 'all', label: '全部' },
    { value: 'content', label: '内容' },
    { value: 'username', label: '用户名' },
    { value: 'link', label: '链接' },
  ],
};

export default function NewSubscriptionForm({ handleAddSuccess, subId }) {
  const typeOptions = [
    { value: '1', label: '快讯' },
    { value: '2', label: '公告' },
    { value: '3', label: 'Twitter' },
  ];
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('1');
  const [webhook, setWebhook] = useState('');
  const keywordTypeOptions = keywordTypeOptionsMap[type];
  const [keywords, setKeywords] = useState([
    { types: [], value: '' }
  ]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (subId) {
      handleGetSubInfo()
    }
  }, [subId]);
  const handleGetSubInfo = async () => {
    // 编辑
    const response = await getSubInfo(subId);
    const {subscription_type: type, webhook_url: webhook} = response.data.subInfo
    let keywordList = response.data.keywordList
    keywordList = keywordList.map(item => ({
      types: [item.keyword_scope],
      value: item.keyword
    }))
    setType(type)
    setWebhook(webhook)
    setKeywords(keywordList)
  }
  const handleKeywordTypeChange = (types, idx) => {
    setKeywords(prev => prev.map((item, i) => i === idx ? { ...item, types } : item));
  };
  const handleKeywordValueChange = (e, idx) => {
    setKeywords(prev => prev.map((item, i) => i === idx ? { ...item, value: e.target.value } : item));
  };
  const handleAddKeyword = () => {
    if (keywords.length < 10) {
      setKeywords(prev => [...prev, { types: [], value: '' }]);
    } else {
      messageApi.error('最多只能添加10个关键词');
    }
  };
  const handleRemoveKeyword = (idx) => {
    setKeywords(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinish = async ({type, webhook}) => {
    const data = {
      subType: type,
      webHookUrl: webhook,  
      keywords: keywords.map(item => ({
        keywordType: item.types,
        keyword: item.value
      }))
    };
    // 编辑
    if(subId) {
      data.subId = subId
    }
    setLoading(true);
    const response = await addSubscription(data);
    if (response.code === 200) {
      messageApi.success('订阅成功');
      handleAddSuccess();
    } else {
      messageApi.error('订阅失败');
    }
    setLoading(false);
  };

  return (
    <>
      {contextHolder}
      <div className={styles.formWrapper}>
        <Spin spinning={loading}>
          <Form layout="horizontal" initialValues={{ type, webhook }} onFinish={handleFinish}>
            <Form.Item label="类型" name="type">
              <Select
                options={typeOptions}
                value={type}
                className={styles.typeSelect}
                onChange={setType}
              />
            </Form.Item>
            <div className={styles.keywordLabelRow}>
              <span>可以使用 & 符号，关联必须同时存在的关键词</span>
            </div>
            <div className={styles.keywordsBlock}>
              <Form.Item label="订阅关键词" name="keywords">
                {keywords.map((item, idx) => (
                  <div className={styles.keywordsRow} key={idx}>
                    <Select
                      mode="multiple"
                      allowClear
                      options={keywordTypeOptions}
                      value={item.types}
                      className={styles.keywordTypeSelect}
                      onChange={types => handleKeywordTypeChange(types, idx)}
                      placeholder="请选择类型"
                    />
                    <Input
                      className={styles.keywordInput}
                      placeholder="请输入关键词"
                      value={item.value}
                      onChange={e => handleKeywordValueChange(e, idx)}
                      addonBefore={item.types.includes('username') ? '@' : null}
                    />
                    {idx === 0 ? (
                      <>
                        <span className={styles.plus} onClick={handleAddKeyword} style={{ cursor: 'pointer' }}>+</span>
                      </>
                    ) : (
                      <span className={styles.plus} onClick={() => handleRemoveKeyword(idx)} style={{ cursor: 'pointer' }}>-</span>
                    )}
                  </div>
                ))}
              </Form.Item>
            </div>
            <div className={styles.webhookRow}>
              <Form.Item label="推送群webhook链接" name="webhook" className={styles.webhookItem}>
                <Input.TextArea rows={2} className={styles.webhookInput}/>
              </Form.Item>
              <a className={styles.botTip}>如何获取bot链接？</a>
            </div>
            <div className={styles.formBtns}>
              <Button type="primary" htmlType="submit" className={styles.submitBtn}>确定</Button>
              <Button className={styles.cancelBtn} onClick={() => handleAddSuccess()}>取消</Button>
            </div>
          </Form>
        </Spin>
      </div>
    </>
  );
} 