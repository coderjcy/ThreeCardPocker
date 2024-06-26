import axios from 'axios'
import type { AxiosRequestConfig, AxiosInstance } from 'axios'

import { ElMessage } from 'element-plus'
// const request = axios.create({
//   baseURL: 'http://localhost:8000'
// })

class Request {
  instance: AxiosInstance
  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)
    this.instance.interceptors.request.use(
      (config) => {
        // 拦截正确

        config.headers.Authorization = localStorage.getItem('token')

        return config
      },
      (err) => {
        // 拦截错误
        console.log(`output->err`, err)
        return Promise.reject(err)
      }
    )
    this.instance.interceptors.response.use(
      (res) => {
        if (res.data.code === 200) return res.data
        return Promise.reject(res.data)
      },
      (err) => {
        // 拦截错误
        console.log(`output->err`, err)
        return Promise.reject(err)
      }
    )
  }

  request(config: AxiosRequestConfig) {
    return new Promise((resolve, reject) => {
      this.instance
        .request({
          ...config
        })
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          ElMessage.error(err)
        })
    })
  }

  get(config: AxiosRequestConfig) {
    return this.request({
      method: 'get',
      ...config
    }) as any
  }
  post(config: AxiosRequestConfig) {
    return this.request({
      method: 'post',
      ...config
    }) as any
  }
  delete(config: AxiosRequestConfig) {}
  put(config: AxiosRequestConfig) {}
}

export default new Request({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  timeout: 60000
})
