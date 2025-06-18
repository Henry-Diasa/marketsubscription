/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-08 16:32:52
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-06-18 16:47:59
 * @FilePath: /marketsubscription/app/components/CurrentSubscriptionTable/CurrentSubscriptionTable.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from "react";
import { Table, Button, message, Popconfirm } from "antd";
import { getSubList, deleteSub } from "../../lib/api";
import styles from "./CurrentSubscriptionTable.module.css";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";

export default function CurrentSubscriptionTable({ handleEdit }) {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subList, setSubList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const { currentLang } = useLanguage();
  const t = useTranslation(currentLang);
  const typeMap = {
    1: t("secondButton.k"),
    2: t("secondButton.announcement"),
    3: t("secondButton.twitter"),
    4: t("secondButton.news"),
  };
  const keywordMap = {
    0: t("new.all"),
    1: t("new.key1"),
    2: t("new.key2"),
    3: t("new.key3"),
    4: t("new.key5"),
    5: t("new.key6"),
    6: t("new.key4"),
  };
  const columns = [
    {
      title: t("current.col1"),
      dataIndex: "subscription_type",
      key: "subscription_type",
      width: 80,
      render: (text) => typeMap[text],
    },
    {
      title: t("current.col2"),
      dataIndex: "keyword",
      key: "keyword",
      width: 180,
      render: (_, record) => {
        return (
          <ul style={{ marginLeft: 10 }}>
            {record.keywords.map((item, index) => (
              <li key={index}>
                <span style={{ fontWeight: "bold", marginRight: 10 }}>
                  {item.keyword_scope
                    .split(",")
                    .map((item) => keywordMap[item])
                    .join("&")}{" "}
                  :{" "}
                </span>
                <span>{item.keyword}</span>
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      title: t("current.col3"),
      dataIndex: "webhook_url",
      key: "webhook_url",
      width: 320,
      render: (text) => (
        <a
          href={text}
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      ),
    },
    {
      title: t("current.col4"),
      key: "actions",
      width: 120,
      render: (_, record) => (
        <>
          <Button
            type="link"
            className={styles.actionBtn}
            onClick={() => handleEdit(record)}
          >
            {t("current.ope1")}
          </Button>
          <Popconfirm
            title={t("modal2.confirmt")}
            onConfirm={() => handleDelete(record)}
            okText={t("modal2.confirm")}
            cancelText={t("modal2.cancel")}
          >
            <Button type="link" className={styles.actionBtn} danger>
              {t("current.ope2")}
            </Button>
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
  };
  const handleDelete = async (record) => {
    const formData = new FormData();
    formData.append("subId", record.subId);
    const response = await deleteSub(formData);
    if (response.code === 200) {
      messageApi.success(t("message.deleteSuccess"));
      fetchSubList();
    } else {
      messageApi.error(t("message.deleteFail"));
    }
  };
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
          dataSource={subList}
          pagination={{
            pageSize: 20,
            current: page,
            showSizeChanger: false,
            size: "small",
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
