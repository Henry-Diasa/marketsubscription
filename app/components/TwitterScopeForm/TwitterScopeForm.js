/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-12 16:43:05
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-05-13 17:41:40
 * @FilePath: /marketsubscription/app/components/TwitterScopeForm.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from "react";
import { Select, Input, message, Button } from "antd";
import { getTwitterScope } from "../../lib/api";
import styles from "../NewSubscriptionForm/NewSubscriptionForm.module.css";

const typeOptions = [
  { value: "1", label: "twitter_id" },
  { value: "2", label: "关键词" },
];

export default function TwitterScopeForm() {
  const [scopes, setScopes] = useState([
    { type: "1", value: "" },
  ]);
  const [messageApi, contextHolder] = message.useMessage();

  const handleTypeChange = (type, idx) => {
    setScopes((prev) => prev.map((item, i) => (i === idx ? { ...item, type } : item)));
  };
  const handleValueChange = (e, idx) => {
    setScopes((prev) => prev.map((item, i) => (i === idx ? { ...item, value: e.target.value } : item)));
  };
  const handleAddScope = () => {
    if (scopes.length < 10) {
      setScopes((prev) => [...prev, { type: "1", value: "" }]);
    }else{
      messageApi.error('最多只能添加10个');
    }
  };
  const handleRemoveScope = (idx) => {
    setScopes((prev) => prev.filter((_, i) => i !== idx));
  };
  // 保存
  const handleSave = () => {
    console.log(scopes);
  }
  const getTwitterData = async () => {
    const res = await getTwitterScope();
    setScopes(res.data);
  }
  useEffect(() => {
    getTwitterData();
  }, [])
  return (
    <div>
      {contextHolder}
      <div className={styles.keywordsBlock}>
        {scopes.map((item, idx) => (
          <div className={styles.keywordsRow} key={idx}>
            <Select
              options={typeOptions}
              value={item.type}
              className={styles.keywordTypeSelect}
              onChange={(type) => handleTypeChange(type, idx)}
              style={{ width: 120 }}
            />
            <Input
              className={styles.keywordInput}
              value={item.value}
              onChange={(e) => handleValueChange(e, idx)}
              addonBefore={item.type === "1" ? "@" : null}
            />
            {idx === 0 ? (
              <span className={styles.plus} onClick={handleAddScope} style={{ cursor: "pointer" }}>+</span>
            ) : (
              <span className={styles.plus} onClick={() => handleRemoveScope(idx)} style={{ cursor: "pointer" }}>-</span>
            )}
          </div>
        ))}
      </div>
      <div className={styles.botTip} style={{ marginTop: 32, padding: 0 }}>
        *因Twitter限额机制，单个用户最多添加10组，如需更多请与开发者联系<br />
        *数据暂时无法做到实时获取，会有几分钟至几小时不等
      </div>
      <div className={styles.formBtns}>
        <Button type="primary" className={styles.submitBtn} onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
} 