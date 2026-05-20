/**
 * 微信登录工具函数
 */
import { request, get, post, put } from './request'

// 微信登录凭证 code 有效期约5分钟
export interface LoginCodeResult {
	code : string
}

// 注册申请数据类型
export interface RegistrationData {
	// 公共字段
	name : string
	unit : string
	role : 'student' | 'teacher'
	// 微信手机号（用户授权后获取）
	phone ?: string
	// 学生专属字段
	studentId ?: string
	major ?: string
	// 老师专属字段
	contact ?: string
}

// API 响应类型
interface ApiResponse<T> {
	code : number
	msg ?: string
	data ?: T
}

// 微信登录响应
export interface WechatLoginResponse {
	token : string
	userId : number
	userType : string
	realName : string
	nickname ?: string
	avatar ?: string
	phone ?: string
}

// 账号密码登录响应
export interface LoginResponse {
	token : string
}

// 验证码响应
export interface CaptchaResponse {
	img : string  // 原始SVG字符串
	uuid : string
	imgDataUrl ?: string  // Base64 Data URL（前端转换后）
}

/**
 * 将SVG转换为Base64 Data URL
 * @param svg - SVG字符串
 * @returns Base64 Data URL
 */
function convertSvgToDataUrl(svg : string) : string {
	// 对SVG进行URL编码，处理特殊字符
	const encoded = encodeURIComponent(svg)
		.replace(/'/g, '%27')
		.replace(/"/g, '%22')
		.replace(/>/g, '%3E')
		.replace(/</g, '%3C')
	return `data:image/svg+xml;charset=utf-8,${encoded}`
}

/**
 * 获取图片验证码
 */
export function getCaptcha() : Promise<CaptchaResponse> {
	return get<CaptchaResponse>('/captchaImage').then(res => {
		// 将SVG转换为Base64 Data URL，以便在image组件中显示
		if (res.img && res.img.startsWith('<svg')) {
			res.imgDataUrl = convertSvgToDataUrl(res.img)
		}
		return res
	})
}

// 学校/部门数据类型
export interface DeptItem {
	deptId : number
	parentId : number | null
	deptName : string
	children ?: DeptItem[]
}

// 学校列表响应
export type DeptListResponse = DeptItem[]

/**
 * 获取微信登录凭证 code
 */
export function getWxLoginCode() : Promise<string> {
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		uni.login({
			provider: 'weixin',
			onlyAuthorize: true,
			success: (res) => {
				if (res.code) {
					resolve(res.code)
				} else {
					reject(new Error('获取登录凭证失败'))
				}
			},
			fail: (err) => {
				reject(new Error(err.errMsg || '微信登录失败'))
			}
		})
		// #endif

		// #ifndef MP-WEIXIN
		reject(new Error('仅支持微信小程序环境'))
		// #endif
	})
}

/**
 * 微信登录（使用code换取用户信息）
 * @param code - 微信授权code
 */
export function wechatLoginByCode(code : string) : Promise<WechatLoginResponse> {
	return post<WechatLoginResponse>('/app/auth/wechat-login', { code }, true)
}

/**
 * 获取学校/部门列表
 */
export function getSchoolList() : Promise<DeptListResponse> {
	return get<DeptListResponse>('/system/dept/public/list')
}

/**
 * 将扁平部门数据转换为树形结构
 */
function buildDeptTree(deptList : DeptItem[]) : DeptItem[] {
	const map = new Map<number, DeptItem>()
	const roots : DeptItem[] = []

	// 先把所有节点放入map
	deptList.forEach(dept => {
		map.set(dept.deptId, { ...dept, children: [] })
	})

	// 再遍历一次，构建树
	deptList.forEach(dept => {
		const node = map.get(dept.deptId)!
		if (dept.parentId === null || dept.parentId === 0) {
			roots.push(node)
		} else {
			const parent = map.get(dept.parentId)
			if (parent) {
				parent.children!.push(node)
			} else {
				// 如果父节点不存在，也作为根节点
				roots.push(node)
			}
		}
	})

	return roots
}

/**
 * 账号密码登录
 * @param uuid - 验证码 UUID
 * @param code - 验证码
 * @param username - 用户名/手机号
 * @param password - 密码
 */
export function loginByPassword(uuid : string, code : string, username : string, password : string) : Promise<LoginResponse> {
	return post<LoginResponse>('/login', { uuid, code, username, password }, true)
}

/**
 * 简化登录（无验证码）
 * @param username - 用户名/手机号
 * @param password - 密码
 */
export function simplifiedLogin(username : string, password : string) : Promise<{ token : string }> {
	return post<{ token : string }>('/api/login', { username, password }, true)
}

/**
 * 获取微信手机号
 * @param e - 微信手机号按钮事件.detail
 * @returns Promise<{ code: string }> - 手机号获取凭证
 */
export function getPhoneNumber(e : { detail : { errMsg : string; code ?: string; phoneNumber ?: string } }) : Promise<{ code : string; phoneNumber ?: string }> {
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		const { errMsg, code, phoneNumber } = e.detail

		if (errMsg !== 'getPhoneNumber:ok') {
			reject(new Error('获取手机号授权失败'))
			return
		}

		// 优先使用微信直接返回的手机号（部分版本支持）
		if (phoneNumber) {
			resolve({ code: code || '', phoneNumber })
			return
		}

		// 否则使用 code 交给后端解密
		if (code) {
			resolve({ code, phoneNumber: undefined })
		} else {
			reject(new Error('获取手机号凭证失败'))
		}
		// #endif

		// #ifndef MP-WEIXIN
		reject(new Error('仅支持微信小程序环境'))
		// #endif
	})
}

// 用户信息类型
export interface UserInfo {
	userId : number
	userType : string
	realName : string
	nickname ?: string
	avatar ?: string
	phone ?: string
	deptName ?: string
	majorGrade ?: string
	studentNo ?: string
	vipStatus : string
}

// 获取当前用户信息
export function getUserInfo() : Promise<UserInfo> {
	return get<UserInfo>('/app/user/info')
}

// 提交意见反馈
export function submitFeedback(content : string) : Promise<{ success : boolean }> {
	return post<{ success : boolean }>('/app/feedback', { content })
}

// 退出登录
export function logout() : Promise<{ success : boolean }> {
	return post<{ success : boolean }>('/app/auth/logout')
}

// 修改密码
export function updatePassword(oldPassword : string, newPassword : string) : Promise<{ success : boolean }> {
	return put<{ success : boolean }>(`/system/user/profile/updatePwd?oldPassword=${oldPassword}&newPassword=${newPassword}`, {})
}

// 标本馆数据类型
export interface Museum {
	museumId : number
	museumName : string
	description : string
	categories : Category[]
}

export interface Category {
	categoryId : number
	categoryName : string
	specCount : number
}

// 标本馆列表响应
export type MuseumListResponse = Museum[]

/**
 * 获取标本馆列表
 */
export function getMuseumList() : Promise<MuseumListResponse> {
	return get<MuseumListResponse>('/app/museum/list')
}

// 标本数据类型
export interface SpecimenItem {
	specimenId : number
	specimenName : string
	LatinName ?: string
	museumId : number
	categoryId : number
	imgUrl ?: string
	description ?: string
}

// 标本列表响应
export interface SpecimenListResponse {
	total : number
	rows : SpecimenItem[]
}

/**
 * 获取标本列表
 * @param categoryId - 分类ID
 * @param museumId - 标本馆ID
 * @param pageNum - 页码
 * @param pageSize - 每页数量
 */
export function getSpecimenList(categoryId : number, museumId : number, pageNum : number = 1, pageSize : number = 20) : Promise<SpecimenListResponse> {
	return get<SpecimenListResponse>('/app/specimen/list', { categoryId, museumId, pageNum, pageSize })
}

// 标本详情响应
export interface SpecimenDetailResponse {
	specimenId : number
	specimenName : string
	LatinName ?: string
	museumId : number
	museumName : string
	categoryId : number
	categoryName : string
	images : string[]
	description ?: string
}

/**
 * 获取标本详情
 * @param specimenId - 标本ID
 */
export function getSpecimenDetail(specimenId : number) : Promise<SpecimenDetailResponse> {
	return get<SpecimenDetailResponse>(`/app/specimen/${specimenId}`)
}

/**
 * 提交注册申请到后端
 * @param data - 注册表单数据
 */
export function submitRegistration(data : RegistrationData) : Promise<ApiResponse<{ pending : boolean }>> {
	return post<ApiResponse<{ pending : boolean }>>('/app/auth/wechat-register', {
		code: data.phone, // 传递手机号作为标识
		phone: data.phone,
		realName: data.name,
		userType: data.role,
		institution: data.unit,
		majorGrade: data.major,
		studentNo: data.studentId,
	})
}

/**
 * 账号密码注册（带验证码）
 * @param uuid - 验证码 UUID
 * @param code - 验证码
 * @param data - 注册数据
 */
export function registerWithCaptcha(uuid : string, code : string, data : {
	username : string
	password : string
	realName : string
	userType : 'student' | 'teacher'
	deptId : string
	majorGrade ?: string
	studentNo ?: string
	contact ?: string
}) : Promise<ApiResponse<{ userId : number }>> {
	return post<ApiResponse<{ userId : number }>>('/app/user/register', {
		uuid,
		code,
		username: data.username,
		phone: data.phone,
		password: data.password,
		realName: data.realName,
		userType: data.userType,
		deptId: data.deptId,
		majorGrade: data.majorGrade,
		studentNo: data.studentNo,
		contact: data.contact,
	}, true)
}

/**
 * 微信用户注册（使用code）
 * @param data - 注册表单数据（含微信code）
 */
export function wechatRegister(data : {
	code : string  // 微信授权code
	realName : string
	userType : 'student' | 'teacher'
	deptId : string  // 学校ID
	institution : string
	majorGrade ?: string  // 专业年级（学生）
	studentNo ?: string   // 学号（学生）
	contact ?: string     // 联系方式（老师）
}) : Promise<ApiResponse<{ userId : number }>> {
	return post<ApiResponse<{ userId : number }>>('/app/auth/wechat-register', {
		code: data.code,
		realName: data.realName,
		userType: data.userType,
		deptId: data.deptId,
		institution: data.institution,
		majorGrade: data.majorGrade,
		studentNo: data.studentNo,
		contact: data.contact,
	})
}