/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-12 16:43:05
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-05-20 21:54:13
 * @FilePath: /marketsubscription/app/components/TwitterScopeForm.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from "react";
import { Select, Input, message, Button,Spin, Popconfirm } from "antd";
import { getTwitterScope, deleteTwitterScope, updateTwitterScope, addTwitterScope } from "../../lib/api";
import styles from "../NewSubscriptionForm/NewSubscriptionForm.module.css";

const typeOptions = [
  { value: '1', label: "twitter_id" },
  { value: '2', label: "关键词" },
];

export default function TwitterScopeForm() {
  const [loading, setLoading] = useState(false);
  const [sourceScopes, setSourceScopes] = useState([]);
  const [scopes, setScopes] = useState([
    { type: '1', value: "" },
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
      setScopes((prev) => [...prev, { type: '1', value: "" }]);
    }else{
      messageApi.error('最多只能添加10个'); 
    }
  };
  const handleRemoveScope = async(idx) => {
    const id = scopes[idx].id
    if(id) {
      const formData = new FormData()
      formData.append('dataId', id)
      setLoading(true)
      const response = await deleteTwitterScope(formData)
      if(response.code === 200) {
        messageApi.success('删除成功');
        setScopes((prev) => prev.filter((_, i) => i !== idx));
      }else{
        messageApi.error('删除失败');
      }
      setLoading(false)
    }else{
      setScopes((prev) => prev.filter((_, i) => i !== idx));
    }
  };
  // 保存
  const handleSave = async () => {
    setLoading(true);
    try {
      const newScopes = scopes.filter(item => !item.id);
      const editScopes = scopes
        .filter(item => item.id)
        .filter(item => {
          const sourceItem = sourceScopes.find(source => source.id === item.id);
          return sourceItem && (
            sourceItem.scope !== item.scope ||
            sourceItem.value !== item.value
          );
        });

      const updateScopes = [...newScopes, ...editScopes];
      const promises = updateScopes.map(async (item) => {
        try {
          const formData = new FormData();
          if (item.id) {
            formData.append('id', item.id);
          }
          formData.append('type', item.type);
          formData.append('value', item.value);

          const response = item.id ? 
            await updateTwitterScope(formData) : 
            await addTwitterScope(formData);

          if (response.code !== 200) {
            throw new Error(item.id ? '更新失败' : '新增失败');
          }
          return response;
        } catch (error) {
          messageApi.error(`${item.value}: ${error.message}`);
          return null;
        }
      });

      await Promise.all(promises);
      messageApi.success('保存成功');
      getTwitterData(); // 刷新数据
    } catch (error) {
      messageApi.error('保存失败');
    } finally {
      setLoading(false);
    }
  };
  const getTwitterData = async () => {
    setLoading(true);
    const res = await getTwitterScope();
    if(res.code === 200) {
      if(res.data.length > 0) {
        setScopes(res.data);
        setSourceScopes(res.data);
      }
    }
    setLoading(false);
  }
  useEffect(() => {
    getTwitterData();
  }, [])
  return (
    <div>
      {contextHolder}
      <div className={styles.keywordsBlock}>
        <Spin spinning={loading}>
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
                addonBefore={item.type === '1' ? "@" : null}
              />
              {idx === 0 ? (
                <span className={styles.plus} onClick={handleAddScope} style={{ cursor: "pointer" }}>+</span>
              ) : (
                <Popconfirm title="确定删除吗？" onConfirm={() => handleRemoveScope(idx)}  okText="确认"
    cancelText="取消">
                <span className={styles.plus} style={{ cursor: "pointer" }}>-</span>
                </Popconfirm>
              )}
            </div>
          ))}
        </Spin>
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