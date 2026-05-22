/**
 * 请求封装工具
 */

const API_BASE_URL = 'https://dhtcm.cn/api'

interface RequestOptions {
	url: string
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
	data?: unknown
	header?: Record<string, string>
	/** 跳过 token，默认 false（为 true 时请求不携带 Authorization） */
	skipToken?: boolean
}

interface ApiResponse<T> {
	code: number
	msg?: string
	data?: T
}

export function request<T>(options: RequestOptions): Promise<T> {
	// 构建 Authorization header
	const token = uni.getStorageSync('token') as string | undefined
	const authValue = token ? `Bearer ${token}` : undefined

	// 构建完整的 header
	const header: Record<string, string> = {
		'Content-Type': 'application/json',
	}

	// 只有在不跳过 token 且有 token 时才添加 Authorization
	if (!options.skipToken && authValue) {
		header['Authorization'] = authValue
	}

	// 合并用户自定义 header
	if (options.header) {
		Object.assign(header, options.header)
	}

	return new Promise((resolve, reject) => {
		uni.request({
			url: API_BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data,
			header,
			success: (res: any) => {
				if (res.statusCode === 200 || res.data.code === 200) {
					const data = res.data as ApiResponse<T>
					if (data.code === 200) {
						resolve(data as T)
					} else {
						uni.showToast({ title: data.msg || '请求失败', icon: 'none' })
						reject(new Error(data.msg))
					}
				} else if (res.statusCode === 401) {
					// Token 过期或无效，清除缓存并跳转登录页
					uni.removeStorageSync('token')
					uni.removeStorageSync('currentUser')
					uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/login/login' })
					}, 1500)
					reject(new Error('登录已过期'))
				} else {
					reject(new Error(res.data.msg || `请求失败: ${res.statusCode}`))
				}
			},
			fail: (err) => {
				uni.showToast({ title: '网络请求失败', icon: 'none' })
				reject(err)
			}
		})
	})
}

export const get = <T>(url: string, params?: unknown, skipToken?: boolean) =>
	request<T>({ url, method: 'GET', data: params, skipToken })

export const post = <T>(url: string, data?: unknown, skipToken?: boolean) =>
	request<T>({ url, method: 'POST', data, skipToken })

export const put = <T>(url: string, data?: unknown, skipToken?: boolean) =>
	request<T>({ url, method: 'PUT', data, skipToken })

export const del = <T>(url: string, skipToken?: boolean) =>
	request<T>({ url, method: 'DELETE', skipToken })