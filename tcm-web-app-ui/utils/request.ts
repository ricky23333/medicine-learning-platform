/**
 * API 请求封装
 * 基于 uni.request 封装，支持 token 认证、错误处理
 */

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: unknown
  header?: Record<string, string>
}

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// API 基础地址（根据环境配置）
const API_BASE_URL = 'http://localhost:5880'

/**
 * 通用请求方法
 */
function request<T>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''

    uni.request({
      url: API_BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = res.data as ApiResponse<T>
          if (data.code === 0 || data.code === 200) {
            resolve(data.data)
          } else {
            uni.showToast({ title: data.msg || '请求失败', icon: 'none' })
            reject(new Error(data.msg || '请求失败'))
          }
        } else if (res.statusCode === 401) {
          // token 过期，跳转登录
          uni.removeStorageSync('token')
          uni.navigateTo({ url: '/pages/login/login' })
          reject(new Error('登录已过期'))
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

export const get = <T>(url: string, params?: unknown) =>
  request<T>({ url, method: 'GET', data: params })

export const post = <T>(url: string, data?: unknown) =>
  request<T>({ url, method: 'POST', data })

export const put = <T>(url: string, data?: unknown) =>
  request<T>({ url, method: 'PUT', data })

export const del = <T>(url: string) =>
  request<T>({ url, method: 'DELETE' })

export default request