/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-13 13:54:25
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-05-21 10:09:00
 * @FilePath: /marketsubscription/app/lib/api.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios';

// 创建axios实例
const api = axios.create({
  timeout: 10000,
  baseURL: 'http://54.238.193.37:8081',
  headers: {
    // 'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 导出api实例，以便在需要时直接使用
export default api; 

// 获取列表筛选项
export const getInfoFlowConfig = async () => {
    try {
      const response = await api.get('/infoSub/infoFlowConfig');
      return response;
    } catch (error) {
      throw error;
    }
};
// 获取列表数据
export const getInfoFlowList = async (data) => {
    try {
      const response = await api.post('/infoSub/infoFlowList', data);
      return response;
    } catch (error) {
      throw error;
    }
};
// 新增数据来源
export const addDataSource = async (data) => {
    try {
      const response = await api.post('/infoSub/addedSource', data);
      return response;
    } catch (error) {
      throw error;
    }
};
// 查看数据范围
export const getTwitterDataAll = async (data) => {
    try {
      const response = await api.post('/infoSub/twitterDataAll', data);
      return response;
    } catch (error) {
      throw error;
    }
};
// 新增订阅
export const addSubscription = async (data) => {
    try {
      const response = await api.post('/infoSub/addSub', data);
      return response;
    } catch (error) {
      throw error;
    }
};
// 更新订阅
export const updateSubscription = async (data) => {
  try {
    const response = await api.post('/infoSub/uptSub', data);
    return response;
  } catch (error) {
    throw error;
  }
};
// 订阅列表
export const getSubList = async () => {
    try {
      const response = await api.get('/infoSub/getSubList');
      return response;
    } catch (error) {
      throw error;
    }
}
// 订阅详情
export const getSubInfo = async (data) => {
    try {
      const response = await api.post('/infoSub/getSubInfo', data);
      return response;
    } catch (error) {
      throw error;
    }
}  
// 删除订阅
export const deleteSub = async (data) => {
    try {
      const response = await api.post('/infoSub/delSubInfo', data);
      return response;
    } catch (error) {
      throw error;
    }
} 


// 新增关键词
export const addSubKeyword = async (data) => {
  try {
    const response = await api.post('/infoSub/addSubKeyWord', data);
    return response;
  } catch (error) {
    throw error;
  }
}
// 删除关键词
export const deleteSubKeyword = async (data) => {
  try {
    const response = await api.post('/infoSub/delSubKeyWord', data);
    return response;
  } catch (error) {
    throw error;
  }
}
// 编辑关键词
export const editSubKeyword = async (data) => {
  try {
    const response = await api.post('/infoSub/uptSubKeyWord', data);
    return response;
  } catch (error) { 
    throw error;
  }
}

// 删除twitter数据源
export const deleteTwitterScope = async (data) => {
  try {
    const response = await api.post('/infoSub/twitterDataDel', data);
    return response;
  } catch (error) {
    throw error;
  }
}
// 更新twitter数据源
export const updateTwitterScope = async (data) => {
  try {
    const response = await api.post('/infoSub/twitterDataUpt', data);
    return response;
  } catch (error) {
    throw error;
  }
}
// 新增twitter数据范围
export const addTwitterScope = async (data) => {
  try {
    const response = await api.post('/infoSub/twitterDataAdd', data);
    return response;
  } catch (error) {
    throw error;
  }
}
// 获取twitter数据源列表
export const getTwitterScope = async () => {
  try {
    const response = await api.get('/infoSub/twitterDataList');
    return response;
  } catch (error) {
    throw error;
  }
}

// 获取token
export const getToken = async (data) => {
  try {
    const response = await api.post(`/infoSub/login`, data);
    return response;
  } catch (error) {
    throw error;
  }
}

export const checkTwitterScope = async (data) => {
  try {
    const response = await api.post('/infoSub/twitterVerify', data);
    return response;
  } catch (error) {
    throw error;
  }
}