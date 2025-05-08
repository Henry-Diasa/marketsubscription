import React from "react";
import { Table, Button } from "antd";
import styles from "./CurrentSubscriptionTable.module.css";

const data = [
  {
    key: 1,
    type: '快讯',
    keywords: 'C2C,P2P,法币',
    webhook: 'https://open.larksuite.com/open-apis/bot/v2/hook/eg9db02c9-da30-4c7f-961d-8332ed130607',
  },
  {
    key: 2,
    type: '公告',
    keywords: 'Gate.io,Binance',
    webhook: 'https://open.larksuite.com/open-apis/bot/v2/hook/eg9db02c9-da30-4c7f-961d-8332ed130607',
  },
  {
    key: 3,
    type: 'Twitter',
    keywords: '黑客',
    webhook: 'https://open.larksuite.com/open-apis/bot/v2/hook/eg9db02c9-da30-4c7f-961d-8332ed130607',
  },
  {
    key: 4,
    type: '快讯',
    keywords: '交易',
    webhook: 'https://open.larksuite.com/open-apis/bot/v2/hook/eg9db02c9-da30-4c7f-961d-8332ed130607xxx',
  },
];

const columns = [
  { title: '类型', dataIndex: 'type', key: 'type', width: 80 },
  { title: '关键词', dataIndex: 'keywords', key: 'keywords', width: 180 },
  {
    title: '推送群',
    dataIndex: 'webhook',
    key: 'webhook',
    width: 320,
    render: (text) => <a href={text} className={styles.link} target="_blank" rel="noopener noreferrer">{text}</a>,
  },
  {
    title: '',
    key: 'actions',
    width: 120,
    render: (_, record) => (
      <>
        <Button type="link" className={styles.actionBtn}>编辑</Button>
        <Button type="link" className={styles.actionBtn} danger>删除</Button>
      </>
    ),
  },
];

export default function CurrentSubscriptionTable() {
  return (
    <div className={styles.tableWrapper}>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="key"
        bordered
        className={styles.antdTable}
      />
    </div>
  );
} 