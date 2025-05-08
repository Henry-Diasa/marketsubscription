/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-08 15:45:07
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-05-08 16:26:01
 * @FilePath: /marketsubscription/app/components/NewSubscriptionForm.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from "react";
import { Form, Select, Input, Button } from "antd";
import styles from "./NewSubscriptionForm.module.css";

const typeOptions = [
  { value: 'news', label: '快讯' },
  { value: 'notice', label: '公告' },
  { value: 'twitter', label: 'Twitter' },
];

const keywordTypeOptionsMap = {
  news: [
    { value: 'all', label: '全部' },
    { value: 'title', label: '标题' },
    { value: 'content', label: '内容' },
    { value: 'media', label: '媒体' },
    { value: 'link', label: '链接' },
  ],
  notice: [
    { value: 'all', label: '全部' },
    { value: 'title', label: '标题' },
    { value: 'content', label: '内容' },
    { value: 'exchange', label: '交易所' },
    { value: 'link', label: '链接' },
  ],
  twitter: [
    { value: 'all', label: '全部' },
    { value: 'content', label: '内容' },
    { value: 'username', label: '用户名' },
    { value: 'link', label: '链接' },
  ],
};

export default function NewSubscriptionForm() {
  const [type, setType] = useState('news');
  const keywordTypeOptions = keywordTypeOptionsMap[type];
  const [keywords, setKeywords] = useState([
    { types: [], value: '' }
  ]);

  const handleKeywordTypeChange = (types, idx) => {
    setKeywords(prev => prev.map((item, i) => i === idx ? { ...item, types } : item));
  };
  const handleKeywordValueChange = (e, idx) => {
    setKeywords(prev => prev.map((item, i) => i === idx ? { ...item, value: e.target.value } : item));
  };
  const handleAddKeyword = () => {
    if (keywords.length < 10) {
      setKeywords(prev => [...prev, { types: [], value: '' }]);
    }
  };
  const handleRemoveKeyword = (idx) => {
    setKeywords(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className={styles.formWrapper}>
      <Form layout="horizontal">
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
          <div className={styles.botTip}>如何获取bot链接？</div>
        </div>
        <div className={styles.formBtns}>
          <Button type="primary" className={styles.submitBtn}>确定</Button>
          <Button className={styles.cancelBtn}>取消</Button>
        </div>
      </Form>
    </div>
  );
} 