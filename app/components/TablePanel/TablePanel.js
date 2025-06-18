"use client";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Select, Button, DatePicker, Table, Modal } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import {
  getInfoFlowConfig,
  getInfoFlowList,
  getTwitterDataAll,
} from "../../lib/api";
import TwitterScopeForm from "../TwitterScopeForm/TwitterScopeForm";
import styles from "./TablePanel.module.css";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";

const TablePanel = forwardRef(({ selectedSecond = "1", token }, ref) => {
  const [selectValue, setSelectValue] = useState(["0"]);
  const [dateRange, setDateRange] = useState(null);
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [scopePage, setScopePage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [dataScopeOpen, setDataScopeOpen] = useState(false);
  const [dataScopeView, setDataScopeView] = useState("view");
  const [loading, setLoading] = useState(false);
  const [twitterScopeLoading, setTwitterScopeLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0);
  const [twitterScopeData, setTwitterScopeData] = useState([]);
  const [twitterScopeTotal, setTwitterScopeTotal] = useState(0);
  const { currentLang } = useLanguage();
  const t = useTranslation(currentLang);
  const [selectOptions, setSelectOptions] = useState([]);
  const map = {
    1: "flashChannels",
    2: "announcementChannels",
    3: "nickName",
    4: "newChannels",
  };
  // 根据selectedSecond动态切换表格列
  let columns, selectLabel;
  if (["1", "4"].includes(selectedSecond)) {
    // 快讯
    columns = [
      {
        title: t("table1.column1"),
        dataIndex: "channel_name",
        key: "channel_name",
        width: 100,
      },
      {
        title: t("table1.column2"),
        dataIndex: "title",
        key: "title",
        width: 220,
      },
      {
        title:
          selectedSecond === "1" ? t("table1.column3") : t("table1.column6"),
        dataIndex: "content",
        key: "content",
        width: 300,
        render: (text) => (
          <div className={styles.content}>
            {text && text.length > 100 ? text.slice(0, 100) + "..." : text}
          </div>
        ),
      },
      {
        title: t("table1.column4"),
        dataIndex: "url",
        key: "url",
        width: 100,
        render: (text) => (
          <a
            href={text}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("table1.view")}
          </a>
        ),
      },
      {
        title: t("table1.column5"),
        dataIndex: "publish_time",
        key: "publish_time",
        width: 160,
      },
    ];
    selectLabel = t("table1.label11");
  } else if (selectedSecond === "2") {
    // 公告
    columns = [
      {
        title: t("table1.column7"),
        dataIndex: "channel_name",
        key: "channel_name",
        width: 100,
      },
      {
        title: t("table1.column2"),
        dataIndex: "title",
        key: "title",
        width: 220,
      },
      {
        title: t("table1.column8"),
        dataIndex: "content",
        key: "content",
        width: 300,
        render: (text) => (
          <div className={styles.content}>
            {text && text.length > 100 ? text.slice(0, 100) + "..." : text}
          </div>
        ),
      },
      {
        title: t("table1.column4"),
        dataIndex: "url",
        key: "url",
        width: 100,
        render: (text) => (
          <a
            href={text}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("table1.view")}
          </a>
        ),
      },
      {
        title: t("table1.column5"),
        dataIndex: "publish_time",
        key: "publish_time",
        width: 160,
      },
    ];
    selectLabel = t("table1.label12");
  } else if (selectedSecond === "3") {
    // twitter
    columns = [
      {
        title: t("table1.column9"),
        dataIndex: "channel_name",
        key: "channel_name",
        width: 100,
      },
      {
        title: t("table1.column10"),
        dataIndex: "content",
        key: "content",
        width: 300,
        render: (text) => (
          <div className={styles.content}>
            {text && text.length > 100 ? text.slice(0, 100) + "..." : text}
          </div>
        ),
      },
      {
        title: t("table1.column4"),
        dataIndex: "url",
        key: "url",
        width: 100,
        render: (text) => (
          <a
            href={text}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("table1.view")}
          </a>
        ),
      },
      {
        title: t("table1.column5"),
        dataIndex: "publish_time",
        key: "publish_time",
        width: 160,
      },
    ];
    selectLabel = t("table1.label13");
  }

  // Twitter数据范围表格数据和分页
  const scopePageSize = 5;
  // antd Table 自带分页
  const scopeColumns = [
    {
      title: t("modal2.col1"),
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (text) => (text === "1" ? "twitter_id" : "关键词"),
    },
    { title: t("modal2.col2"), dataIndex: "value", key: "value", width: 240 },
  ];

  const fetchData = async (reset = false) => {
    const formData = new FormData();
    formData.append("type", selectedSecond);
    formData.append("page", page);
    formData.append("limit", pageSize);
    if (!selectValue.includes("0")) {
      formData.append("channel_name", reset ? "" : selectValue.join(","));
    }
    formData.append(
      "start_time",
      reset ? "" : dateRange ? dateRange[0].format("YYYY-MM-DD HH:mm:ss") : ""
    );
    formData.append(
      "end_time",
      reset ? "" : dateRange ? dateRange[1].format("YYYY-MM-DD HH:mm:ss") : ""
    );
    setLoading(true);
    const response = await getInfoFlowList(formData);
    setTableData(response.data.list);
    setTotal(response.data.total);
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
    const selectOptions = response.data[map[selectedSecond]].map((item) => ({
      value: item,
      label: item,
    }));
    setSelectOptions([
      {
        value: "0",
        label: t("new.all"),
      },
      ...selectOptions,
    ]);
  };
  useEffect(() => {
    setSelectValue(["0"]);
    if (token) {
      getInfoFlow();
      fetchData(true);
    }
  }, [selectedSecond, token]);

  useEffect(() => {
    setSelectValue(["0"]);
    if (token) {
      fetchData();
    }
  }, [page]);

  useEffect(() => {
    if (dataScopeOpen) {
      handleDataScope();
    }
  }, [scopePage]);
  const handleDateRangeChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      // 设置开始日期为当天的 00:00:00
      const startDate = start.startOf("day");
      // 设置结束日期为当天的 23:59:59
      const endDate = end.endOf("day");
      setDateRange([startDate, endDate]);
    } else {
      setDateRange(null);
    }
  };
  const handleDataScope = async (reset = false) => {
    const formData = new FormData();
    formData.append("page", reset ? 1 : scopePage);
    formData.append("limit", scopePageSize);
    setDataScopeOpen(true);
    setTwitterScopeLoading(true);
    const response = await getTwitterDataAll(formData);
    setTwitterScopeData(response.data.list);
    setTwitterScopeTotal(response.data.total);
    setTwitterScopeLoading(false);
  };
  const handleAddDataScope = () => {
    setDataScopeOpen(true);
    setDataScopeView("add");
  };

  useImperativeHandle(ref, () => ({
    handleAddDataScope,
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
              maxTagCount="responsive"
              onChange={(value) => {
                if (value[value.length - 1] === "0") {
                  setSelectValue(["0"]);
                } else {
                  setSelectValue(value.filter((v) => v !== "0"));
                }
              }}
              mode="multiple"
            />
          </div>
          <div className={styles.filterItemRow}>
            <div className={styles.filterItemCol}>
              <div className={styles.filterLabel}>{t("table1.label2")}</div>
              <DatePicker.RangePicker
                className={styles.rangePicker}
                value={dateRange}
                onChange={handleDateRangeChange}
                allowClear
              />
            </div>
            <Button
              type="primary"
              className={styles.filterBtn}
              onClick={() => fetchData()}
            >
              {t("table1.button1")}
            </Button>
            <Button
              className={styles.filterBtn}
              disabled={
                selectValue.filter((v) => v !== "").length === 0 && !dateRange
              }
              onClick={() => {
                setSelectValue(["0"]);
                setDateRange(null);
                setPage(1);
                fetchData(true);
              }}
            >
              {t("table1.button2")}
            </Button>
            {selectedSecond === "3" && (
              <Button
                className={styles.filterBtn}
                type="default"
                onClick={handleDataScope}
              >
                {t("table1.button3")}
              </Button>
            )}
          </div>
        </div>
        <div className={styles.filterBtnsRight}>
          <Button
            icon={<ReloadOutlined />}
            className={styles.filterBtn}
            loading={refreshing}
            onClick={handleRefresh}
          >
            {t("table1.button4")}
          </Button>
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
          size: "small",
        }}
        rowKey="key"
        size="middle"
        bordered
        className={styles.antdTable}
        loading={loading}
      />

      <Modal
        open={dataScopeOpen}
        className={"dataScopeModal"}
        onCancel={() => {
          setDataScopeOpen(false);
          setScopePage(1);
          setDataScopeView("view");
        }}
        footer={null}
        centered
        title={<div className={styles.dataScopeTitle}>{t("modal2.title")}</div>}
      >
        <div className={styles.dataScopeButtons}>
          <Button
            type={dataScopeView === "view" ? "primary" : "default"}
            onClick={() => {
              setDataScopeView("view");
              setScopePage(1);
              handleDataScope(true);
            }}
            className={styles.dataScopeButton}
          >
            {t("modal2.tab1")}
          </Button>
          <Button
            type={dataScopeView === "add" ? "primary" : "default"}
            onClick={() => setDataScopeView("add")}
            className={styles.dataScopeButton}
          >
            {t("modal2.tab2")}
          </Button>
        </div>

        {dataScopeView === "view" && (
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
              size: "small",
            }}
            rowKey="key"
            size="middle"
            bordered
            className={styles.scopeAntdTable}
          />
        )}

        {dataScopeView === "add" && (
          <div className={styles.addDataScope}>
            <TwitterScopeForm
              handleCancel={() => {
                setDataScopeView("view");
                setScopePage(1);
                handleDataScope(true);
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
});

TablePanel.displayName = "TablePanel";

export default TablePanel;
