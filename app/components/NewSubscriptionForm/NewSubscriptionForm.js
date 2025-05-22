/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-08 15:45:07
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-05-22 18:06:59
 * @FilePath: /marketsubscription/app/components/NewSubscriptionForm.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from "react";
import { Form, Select, Input, Button, message, Spin, Popconfirm } from "antd";
import { addSubscription,updateSubscription, getSubInfo, deleteSubKeyword, editSubKeyword, addSubKeyword } from "../../lib/api";
import styles from "./NewSubscriptionForm.module.css";



const keywordTypeOptionsMap = {
  1: [
    { value: 0, label: '全部' },
    { value: 1, label: '标题' },
    { value: 2, label: '内容' },
    { value: 3, label: '媒体' },
    { value: 6, label: '链接' },
  ],
  2: [
    { value: 0, label: '全部' },
    { value: 1, label: '标题' },
    { value: 2, label: '内容' },
    { value: 4, label: '交易所' },
    { value: 6, label: '链接' },
  ],
  3: [
    { value: 0, label: '全部' },
    { value: 2, label: '内容' },
    { value: 5, label: '用户名' },
    { value: 6, label: '链接' },
  ],
  4: [
    { value: 0, label: '全部' },
    { value: 1, label: '标题' },
    { value: 2, label: '内容' },
    { value: 3, label: '媒体' },
    { value: 6, label: '链接' },
  ],
};

export default function NewSubscriptionForm({ handleAddSuccess, subId }) {
  const typeOptions = [
    { value: 1, label: '快讯' },
    { value: 2, label: '公告' },
    { value: 3, label: 'Twitter' },
    { value: 4, label: '新闻' },
  ];
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(1);
  const [webhook, setWebhook] = useState('');
  const keywordTypeOptions = keywordTypeOptionsMap[Number(type)];
  const [sourceKeywords, setSourceKeywords] = useState([]);
  const [keywords, setKeywords] = useState([
    { types: [], value: '' },
  ]);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  useEffect(() => {
    if (subId) {
      handleGetSubInfo()
    }
  }, [subId]);
  const handleGetSubInfo = async () => {
    // 编辑
    const formData = new FormData();
    formData.append('subId', subId);
    setLoading(true);
    const response = await getSubInfo(formData);
    setLoading(false);
    const {subscription_type: type, webhook_url: webhook} = response.data.subInfo
    let keywordList = response.data.keywordList
    keywordList = keywordList.map(item => ({
      types: item.keyword_scope.split(',').map(Number),
      value: item.keyword,
      id: item.id
    }))
    setType(type)
    setWebhook(webhook)
    setKeywords(keywordList)
    setSourceKeywords(keywordList)

    form.setFieldsValue({ webhook });
  }
  const handleKeywordTypeChange = (types, idx) => {
    if(types[types.length - 1] === 0) {
      types = [0]
    }else{
      types = types.filter(item => item !== 0)
    }
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
  const handleRemoveKeyword = async (idx) => {
    const id = keywords[idx].id
    if(id) {
      const formData = new FormData();
      formData.append('subId', subId);
      formData.append('keywordId', id);
      setLoading(true)  
      const response = await deleteSubKeyword(formData)
      if(response.code === 200) {
        messageApi.success('删除成功');
        setKeywords(prev => prev.filter((_, i) => i !== idx))
      } else {
        messageApi.error('删除失败');
      }
      setLoading(false)
    }else{
      setKeywords(prev => prev.filter((_, i) => i !== idx))
    } 
  };

  const handleFinish = async ({type, webhook}) => {
    let data = {
      subType: type,
      webHookUrl: webhook,  
      keywords: keywords.map(item => ({
        keywordType: item.types.join(','),
        keyword: item.value
      }))
    };
    setLoading(true);
    // 处理关键词的新增和编辑
    const newKeywords = keywords.filter(item => !item.id).map(item => ({
      keywordType: item.types.join(','),
      keyword: item.value
    }));
    
    const modifiedKeywords = keywords
      .filter(item => item.id)
      .filter(item => {
        const sourceItem = sourceKeywords.find(source => source.id === item.id);
        return sourceItem && (
          sourceItem.types.join(',') !== item.types.join(',') ||
          sourceItem.value !== item.value
        );
      })
      .map(item => ({
        keywordType: item.types.join(','),
        keyword: item.value,
        id: item.id
      }));

    // 更新订阅
    if(subId) {
      data = {
        ...data,
        subId
      }
      const updateKeys = [...newKeywords, ...modifiedKeywords]
      try {
        const promises = updateKeys.map(async (item) => {
          try {
            const formData = new FormData()
            formData.append('subId', subId)
            if(item.id) {
              formData.append('keywordId', item.id)
            }
            formData.append('keyword_scope', item.keywordType)
            formData.append('keyword', item.keyword)
            
            const response = item.id ? 
              await editSubKeyword(formData) : 
              await addSubKeyword(formData)
            
            if (response.code !== 200) {
              throw new Error(item.id ? '更新关键词失败' : '新增关键词失败')
            }
            return response
          } catch (error) {
            messageApi.error(`${item.keyword}: ${error.message}`)
            return null
          }
        })

        await Promise.all(promises)
      } catch (error) {
        messageApi.error('关键词处理失败')
        setLoading(false)
        return
      }
    }
    const formData = new FormData();
    formData.append('subId', subId);
    formData.append('webHookUrl', webhook);
    const response = subId ? await updateSubscription(formData) : await addSubscription(data);
    if (response.code === 200) {
      messageApi.success(subId ? '更新成功' : '订阅成功');
      handleAddSuccess();
    } else {
      messageApi.error(subId ? '更新失败' : '订阅失败');
    }
    setLoading(false);
  };

  return (
    <>
      {contextHolder}
      <div className={styles.formWrapper}>
        <Spin spinning={loading}>
          <Form form={form} layout="horizontal" initialValues={{ type, webhook }} onFinish={handleFinish}>
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
                      <Popconfirm title="确定删除吗？" onConfirm={() => handleRemoveKeyword(idx)}  okText="确认"
    cancelText="取消">
                      <span className={styles.plus} style={{ cursor: 'pointer' }}>-</span>
                      </Popconfirm>
                    )}
                  </div>
                ))}
              </Form.Item>
            </div>
            <div className={styles.webhookRow}>
              <Form.Item label="推送群webhook链接" name="webhook" className={styles.webhookItem}>
                <Input.TextArea rows={2} className={styles.webhookInput}/>
              </Form.Item>
              <a className={styles.botTip} target="_blank" rel="noopener noreferrer" href="https://open.larksuite.com/document/client-docs/bot-v3/add-custom-bot">如何获取bot链接？</a>
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