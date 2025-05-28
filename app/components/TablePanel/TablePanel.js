'use client'
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Select, Button, DatePicker, Table, Modal } from "antd";
import { ReloadOutlined } from '@ant-design/icons';
import { getInfoFlowConfig, getInfoFlowList, getTwitterDataAll } from '../../lib/api';
import TwitterScopeForm from "../TwitterScopeForm/TwitterScopeForm";
import styles from "./TablePanel.module.css";


const TablePanel = forwardRef(({ selectedSecond = '1', token }, ref) => {
  const [selectValue, setSelectValue] = useState(['0']);
  const [dateRange, setDateRange] = useState(null);
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [scopePage, setScopePage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [dataScopeOpen, setDataScopeOpen] = useState(false);
  const [dataScopeView, setDataScopeView] = useState('view');
  const [loading, setLoading] = useState(false);
  const [twitterScopeLoading, setTwitterScopeLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0);
  const [twitterScopeData, setTwitterScopeData] = useState([]);
  const [twitterScopeTotal, setTwitterScopeTotal] = useState(0);
  const [selectOptions, setSelectOptions] = useState([
    {
      value: '0',
      label: '全部'
    },
    {
      value: 'PANEWS',
      label: 'PANEWS'
    },
    {
      value: 'PANEWS1',
      label: 'PANEWS1'
    },
    
  ]);
  const map = {
    1: "flashChannels",
    2: "announcementChannels",
    3: "nickName",
    4: "newChannels"
  }
  // 根据selectedSecond动态切换表格列
  let columns, selectLabel;
  if (['1', '4'].includes(selectedSecond)) {
    // 快讯
    columns = [
      { title: '媒体', dataIndex: 'channel_name', key: 'channel_name', width: 100 },
      { title: '标题', dataIndex: 'title', key: 'title', width: 220 },
      { title: selectedSecond === '1' ? '快讯内容' : '新闻内容', dataIndex: 'content', key: 'content', width: 300, 
        render: (text) => <div className={styles.content}>{text && text.length > 100 ? text.slice(0, 100) + '...' : text}</div>
      },
      {
        title: '原文链接',
        dataIndex: 'url',
        key: 'url',
        width: 100,
        render: (text) => <a href={text} className={styles.link} target="_blank" rel="noopener noreferrer">查看</a>,
      },
      { title: '时间', dataIndex: 'publish_time', key: 'publish_time', width: 160 },
    ];
    selectLabel = '选择媒体';
  } else if (selectedSecond === '2') {
    // 公告
    columns = [
      { title: '交易所', dataIndex: 'channel_name', key: 'channel_name', width: 100 },
      { title: '标题', dataIndex: 'title', key: 'title', width: 220 },
      { title: '公告内容', dataIndex: 'content', key: 'content', width: 300, 
        render: (text) => <div className={styles.content}>{text && text.length > 100 ? text.slice(0, 100) + '...' : text}</div>
      },
      {
        title: '原文链接',
        dataIndex: 'url',
        key: 'url',
        width: 100,
        render: (text) => <a href={text} className={styles.link} target="_blank" rel="noopener noreferrer">查看</a>,
      },
      { title: '时间', dataIndex: 'publish_time', key: 'publish_time', width: 160 },
    ];
    selectLabel = '选择交易所';
  } else if (selectedSecond === '3') {
    // twitter
    columns = [
      { title: '作者', dataIndex: 'channel_name', key: 'channel_name', width: 100 },
      { title: '推文内容', dataIndex: 'content', key: 'content', width: 300, 
        render: (text) => <div className={styles.content}>{text && text.length > 100 ? text.slice(0, 100) + '...' : text}</div>
      },
      {
        title: '原文链接',
        dataIndex: 'url',
        key: 'url',
        width: 100,
        render: (text) => <a href={text} className={styles.link} target="_blank" rel="noopener noreferrer">查看</a>,
      },
      { title: '时间', dataIndex: 'publish_time', key: 'publish_time', width: 160 },
    ];
    selectLabel = '选择作者';
  }

  // Twitter数据范围表格数据和分页
  const scopePageSize = 5;
  // antd Table 自带分页
  const scopeColumns = [
    { title: '类型', dataIndex: 'type', key: 'type', width: 120, render: (text) => text === '1' ? 'twitter_id' : '关键词'  },
    { title: '内容', dataIndex: 'value', key: 'value', width: 240 },
  ];

  const fetchData = async (reset = false) => {
    const formData = new FormData();
    formData.append('type', selectedSecond);
    formData.append('page', page);
    formData.append('limit', pageSize);
    if(!selectValue.includes('0')) {
      formData.append('channel_name', reset ? '' : selectValue.join(','));
    }
    formData.append('start_time', reset ? '' : dateRange ? dateRange[0].format('YYYY-MM-DD HH:mm:ss') : '');
    formData.append('end_time', reset ? '' : dateRange ? dateRange[1].format('YYYY-MM-DD HH:mm:ss') : ''); 
    setLoading(true);
    const response = await getInfoFlowList(formData)
    setTableData(response.data.list)
    setTotal(response.data.total)
    setLoading(false);
    setRefreshing(false);
  };
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  // 获取表格筛选项
  const getInfoFlow = async () => {
    const response = await getInfoFlowConfig();
    const selectOptions = response.data[map[selectedSecond]].map(item => ({
      value: item,
      label: item
    }));
    setSelectOptions([{
      value: '0',
      label: '全部'
    }, ...selectOptions]);
  }
  useEffect(() => {
    setSelectValue(['0']);
    if(token) {
      getInfoFlow()
      fetchData(true)
    }
  }, [selectedSecond, token]);

  useEffect(() => {
    setSelectValue(['0']);
    if(token) {
      fetchData()
    }
  }, [page])

  useEffect(() => {
    if(dataScopeOpen) {
      handleDataScope()
    }
  }, [scopePage])
  const handleDateRangeChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      // 设置开始日期为当天的 00:00:00
      const startDate = start.startOf('day');
      // 设置结束日期为当天的 23:59:59
      const endDate = end.endOf('day');
      setDateRange([startDate, endDate]);
    } else {
      setDateRange(null);
    }
  };
  const handleDataScope = async (reset = false) => {
    const formData = new FormData();
    formData.append('page', reset ? 1 : scopePage);
    formData.append('limit', scopePageSize);
    setDataScopeOpen(true);
    setTwitterScopeLoading(true);
    const response = await getTwitterDataAll(formData);
    setTwitterScopeData(response.data.list);
    setTwitterScopeTotal(response.data.total);
    setTwitterScopeLoading(false);
  }
  const handleAddDataScope = () => {
    setDataScopeOpen(true);
    setDataScopeView('add');
  }

  useImperativeHandle(ref, () => ({
    handleAddDataScope
  }));

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
              maxTagCount='responsive'
              onChange={(value) => {
                if (value[value.length - 1] === '0') {
                  setSelectValue(['0']);
                } else {
                  setSelectValue(value.filter(v => v !== '0'));
                }
              }}
              mode="multiple"
            />
          </div>
          <div className={styles.filterItemRow}>
            <div className={styles.filterItemCol}>
              <div className={styles.filterLabel}>选择时间范围</div>
              <DatePicker.RangePicker
                className={styles.rangePicker}
                value={dateRange}
                onChange={handleDateRangeChange}
                allowClear
              />
            </div>
            <Button type="primary" className={styles.filterBtn} onClick={() => fetchData()}>筛选</Button>
            <Button className={styles.filterBtn} disabled={selectValue.filter(v => v !== '').length === 0 && !dateRange} onClick={() => {
              setSelectValue(['0']);
              setDateRange(null);
              setPage(1);
              fetchData(true);
            }}>重置</Button>
            {selectedSecond === '3' && (
              <Button className={styles.filterBtn} type="default" onClick={handleDataScope}>查看/添加数据范围</Button>
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
        dataSource={tableData}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: setPage,
          showSizeChanger: false,
          size: 'small',
        }}
        rowKey="key"
        size="middle"
        bordered
        className={styles.antdTable}
        loading={loading}
      />

      <Modal
        open={dataScopeOpen}
        onCancel={() => {
          setDataScopeOpen(false);
          setScopePage(1);
          setDataScopeView('view');
        }}
        footer={null}
        centered
        className={styles.dataScopeModal}
        title={<div className={styles.dataScopeTitle}>Twitter数据范围</div>}
      >
        <div className={styles.dataScopeButtons}>
          <Button 
            type={dataScopeView === 'view' ? 'primary' : 'default'} 
            onClick={() => {
              setDataScopeView('view');
              setScopePage(1);
              handleDataScope(true)
            }}
            className={styles.dataScopeButton}
          >
            查看数据范围
          </Button>
          <Button 
            type={dataScopeView === 'add' ? 'primary' : 'default'} 
            onClick={() => setDataScopeView('add')}
            className={styles.dataScopeButton}
          >
            添加数据范围
          </Button>
        </div>
        
        {dataScopeView === 'view' && (
          <Table
            loading={twitterScopeLoading}
            columns={scopeColumns}
            dataSource={twitterScopeData}
            pagination={{
              current: scopePage,
              pageSize: scopePageSize,
              total: twitterScopeTotal,
              onChange: setScopePage,
              showSizeChanger: false,
              size: 'small',
            }}
            rowKey="key"
            size="middle"
            bordered
            className={styles.scopeAntdTable}
          />
        )}
        
        {dataScopeView === 'add' && (
          <div className={styles.addDataScope}>
            <TwitterScopeForm handleCancel={() => {
              setDataScopeView('view');
              setScopePage(1);
              handleDataScope(true)
            }}/>
          </div>
        )}
      </Modal>
    </div>
  );
});

TablePanel.displayName = 'TablePanel';

export default TablePanel; 