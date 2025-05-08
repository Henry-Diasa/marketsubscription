'use client'
import React, { useState } from "react";
import { Select, Button, DatePicker, Table, Modal, Pagination } from "antd";
import { ReloadOutlined } from '@ant-design/icons';
import styles from "./TablePanel.module.css";

const { RangePicker } = DatePicker;

const data = [
  {
    key: 1,
    media: "PANEWS",
    title: "",
    content: "美股收盘：三大股指再度大跌，特斯拉挫逾7%...",
    link: "#",
    time: "2024-05-01 10:00",
    exchange: "Binance",
    notice: "Binance公告内容...",
    author: "@elonmusk",
    tweet: "This is a tweet...",
  },
  // 可添加更多数据
];

const mediaOptions = [
  { value: 'all', label: '全部' },
  { value: 'PANEWS', label: 'PANEWS' },
];
const exchangeOptions = [
  { value: 'all', label: '全部' },
  { value: 'Binance', label: 'Binance' },
];
const authorOptions = [
  { value: 'all', label: '全部' },
  { value: '@elonmusk', label: '@elonmusk' },
];

export default function TablePanel({ selectedSecond = 'news' }) {
  const [selectValue, setSelectValue] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [refreshing, setRefreshing] = useState(false);
  const [dataScopeOpen, setDataScopeOpen] = useState(false);

  // 根据selectedSecond动态切换表格列
  let columns, selectLabel, selectOptions;
  if (selectedSecond === 'news') {
    columns = [
      { title: '媒体', dataIndex: 'media', key: 'media', width: 100 },
      { title: '标题', dataIndex: 'title', key: 'title', width: 120 },
      { title: '快讯内容', dataIndex: 'content', key: 'content', width: 300 },
      {
        title: '原文链接',
        dataIndex: 'link',
        key: 'link',
        width: 100,
        render: (text) => <a href={text} className={styles.link} target="_blank" rel="noopener noreferrer">查看</a>,
      },
      { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
    ];
    selectLabel = '选择媒体';
    selectOptions = mediaOptions;
  } else if (selectedSecond === 'notice') {
    columns = [
      { title: '交易所', dataIndex: 'exchange', key: 'exchange', width: 100 },
      { title: '标题', dataIndex: 'title', key: 'title', width: 120 },
      { title: '公告内容', dataIndex: 'notice', key: 'notice', width: 300 },
      {
        title: '原文链接',
        dataIndex: 'link',
        key: 'link',
        width: 100,
        render: (text) => <a href={text} className={styles.link} target="_blank" rel="noopener noreferrer">查看</a>,
      },
      { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
    ];
    selectLabel = '选择交易所';
    selectOptions = exchangeOptions;
  } else if (selectedSecond === 'twitter') {
    columns = [
      { title: '作者', dataIndex: 'author', key: 'author', width: 120 },
      { title: '推文内容', dataIndex: 'tweet', key: 'tweet', width: 360 },
      {
        title: '原文链接',
        dataIndex: 'link',
        key: 'link',
        width: 100,
        render: (text) => <a href={text} className={styles.link} target="_blank" rel="noopener noreferrer">查看</a>,
      },
      { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
    ];
    selectLabel = '选择作者';
    selectOptions = authorOptions;
  }

  // Twitter数据范围表格数据和分页
  const twitterScopeData = [
    { key: 1, type: 'twitter_id', content: '@elonmusk' },
    { key: 2, type: '关键词', content: 'binance' },
    // 可添加更多数据
  ];
  const [scopePage, setScopePage] = useState(1);
  const scopePageSize = 5;
  // antd Table 自带分页
  const scopeColumns = [
    { title: '类型', dataIndex: 'type', key: 'type', width: 120 },
    { title: '内容', dataIndex: 'content', key: 'content', width: 240 },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className={styles.tableWrapper}>
      {/* 筛选区 */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <div className={styles.filterLabel}>{selectLabel}</div>
            <Select
              value={selectValue}
              options={selectOptions}
              className={styles.select}
              onChange={setSelectValue}
            />
          </div>
          <div className={styles.filterItemRow}>
            <div className={styles.filterItemCol}>
              <div className={styles.filterLabel}>选择时间范围</div>
              <DatePicker.RangePicker
                className={styles.rangePicker}
                value={dateRange}
                onChange={setDateRange}
                allowClear
              />
            </div>
            <Button type="primary" className={styles.filterBtn}>筛选</Button>
            <Button className={styles.filterBtn}>重置</Button>
            {selectedSecond === 'twitter' && (
              <Button className={styles.filterBtn} type="default" onClick={() => setDataScopeOpen(true)}>查看数据范围</Button>
            )}
          </div>
        </div>
        <div className={styles.filterBtnsRight}>
          <Button icon={<ReloadOutlined />} className={styles.filterBtn} loading={refreshing} onClick={handleRefresh}>刷新</Button>
        </div>
      </div>
      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          current: page,
          pageSize,
          total: data.length,
          onChange: setPage,
          showSizeChanger: false,
          size: 'small',
        }}
        rowKey="key"
        size="middle"
        bordered
        className={styles.antdTable}
      />
      <Modal
        open={dataScopeOpen}
        onCancel={() => setDataScopeOpen(false)}
        footer={null}
        centered
        className={styles.dataScopeModal}
        title={<div className={styles.dataScopeTitle}>Twitter数据范围</div>}
      >
        <Table
          columns={scopeColumns}
          dataSource={twitterScopeData}
          pagination={{
            current: scopePage,
            pageSize: scopePageSize,
            total: twitterScopeData.length,
            onChange: setScopePage,
            showSizeChanger: false,
            size: 'small',
          }}
          rowKey="key"
          size="middle"
          bordered
          className={styles.scopeAntdTable}
        />
      </Modal>
    </div>
  );
} 