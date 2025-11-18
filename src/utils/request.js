import axios from 'axios'
import errorCode from '@/utils/errorCode'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10 * 60 * 1000,
})

// request拦截器
service.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    console.log(error)
    Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res
    }

    // 新版 API 直接返回数据对象，不包含 code 字段
    // 如果响应数据包含 error 字段，则认为是错误响应
    if (res.data && res.data.error) {
      return Promise.reject(new Error(res.data.error))
    }

    // 兼容旧版 API 格式
    const code = res.data.code
    if (code !== undefined) {
      const msg = errorCode[code] || res.data.msg || errorCode['default']
      if (code === 401) {
        return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
      } else if (code === 500) {
        return Promise.reject(new Error(msg))
      } else if (code !== 200) {
        return Promise.reject('error')
      }
      return res.data
    }

    // 新版 API 直接返回数据
    return res.data
  },
  (error) => {
    console.log('err' + error)
    let { message } = error
    if (message === 'Network Error') {
      message = '后端接口连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.slice(-3) + '异常'
    }
    return Promise.reject(error)
  }
)

export default service
