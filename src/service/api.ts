import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 基础URL配置
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://holdoumenback-production.up.railway.app/';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应数据
    return response.data;
  },
  (error) => {
    // 处理错误
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，跳转到登录页
          // router.push('/login');
          break;
        case 403:
          // 禁止访问
          console.error('Forbidden');
          break;
        case 404:
          // 资源不存在
          console.error('Not Found');
          break;
        case 500:
          // 服务器错误
          console.error('Server Error');
          break;
        default:
          console.error('Request Error:', data.message || 'Unknown error');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('Network Error');
    } else {
      // 请求配置出错
      console.error('Request Configuration Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 封装请求方法
const api = {
  // GET请求
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.get(url, config);
  },

  // POST请求
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.post(url, data, config);
  },

  // PUT请求
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.put(url, data, config);
  },

  // DELETE请求
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.delete(url, config);
  },

  // PATCH请求
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.patch(url, data, config);
  },
};

export default api;

export type { AxiosRequestConfig, AxiosResponse };