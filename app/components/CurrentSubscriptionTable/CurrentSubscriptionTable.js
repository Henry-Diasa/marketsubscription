/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-08 16:32:52
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-05-20 21:06:40
 * @FilePath: /marketsubscription/app/components/CurrentSubscriptionTable/CurrentSubscriptionTable.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, {useEffect, useState} from "react";
import { Table, Button, message, Popconfirm } from "antd";
import { getSubList, deleteSub } from "../../lib/api";
import styles from "./CurrentSubscriptionTable.module.css";


const typeMap = {
  1: '快讯',
  2: '公告',
  3: 'Twitter',
  4: '新闻',
}


export default function CurrentSubscriptionTable({ handleEdit }) {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subList, setSubList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const columns = [
    { title: '类型', dataIndex: 'subscription_type', key: 'subscription_type', width: 80, render: (text) => typeMap[text] },
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 180 },
    {
      title: '推送群',
      dataIndex: 'webhook_url',
      key: 'webhook_url',
      width: 320,
      render: (text) => <a href={text} className={styles.link} target="_blank" rel="noopener noreferrer">{text}</a>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <>
          <Button type="link" className={styles.actionBtn} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record)}  okText="确认"
    cancelText="取消">
            <Button type="link" className={styles.actionBtn} danger>删除</Button>
          </Popconfirm>
        </>
      ),
    },
  ];
  const fetchSubList = async () => {
    setLoading(true);
    const response = await getSubList();
    setSubList(Object.values(response.data));
    setLoading(false);
  }
  const handleDelete = async (record) => {
    const formData = new FormData();
    formData.append('subId', record.subId);
    const response = await deleteSub(formData);
    if(response.code === 200) {
      messageApi.success('删除成功');
      fetchSubList();
    } else {
      messageApi.error('删除失败');
    }
  }
  useEffect(() => {
    fetchSubList();
  }, [page]);
  return (
    <>
      {contextHolder}
      <div className={styles.tableWrapper}>
        <Table
          loading={loading}
          columns={columns}
          dataSource ={subList}
          pagination={{
            pageSize: 20,
            current: page,
            showSizeChanger: false,
            size: 'small',
            total,
            onChange: setPage,
          }}
          bordered
          className={styles.antdTable}
        />
      </div>
    </>
  );
} 