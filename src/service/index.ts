import axios from 'axios'
import type { AxiosRequestConfig, AxiosInstance } from 'axios'

import { ElMessage, ElLoading } from 'element-plus'
// const request = axios.create({
//   baseURL: 'http://localhost:8000'
// })
interface IConfig extends AxiosRequestConfig {
  loading?: boolean
}

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
  request(config: IConfig) {
    return new Promise((resolve, reject) => {
      let loading: any
      if (config.loading) {
        loading = ElLoading.service({
          lock: true,
          text: '加载中...',
          background: 'rgba(0, 0, 0, 0.5)'
        })
      }
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
        .finally(() => {
          if (loading) loading.close()
        })
    })
  }

  get(config: IConfig) {
    return this.request({
      method: 'get',
      ...config
    }) as any
  }
  post(config: IConfig) {
    return this.request({
      method: 'post',
      ...config
    }) as any
  }
  delete(config: IConfig) {}
  put(config: IConfig) {}
}

export default new Request({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  timeout: 60000
})
