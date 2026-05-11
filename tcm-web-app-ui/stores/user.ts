/**
 * 用户状态管理
 * 使用 Pinia 风格管理用户登录状态
 */

import { ref, computed } from 'vue'
import type { User } from '@/utils/mock'
import { mockLogin, DEMO_ACCOUNTS } from '@/utils/mock'

// 状态
const currentUser = ref<User | null>(null)
const token = ref<string>('')

// 初始化 - 从本地存储恢复
function initFromStorage() {
  const storedUser = uni.getStorageSync('currentUser')
  const storedToken = uni.getStorageSync('token')
  if (storedUser && storedToken) {
    currentUser.value = storedUser
    token.value = storedToken
  }
}

// 初始化
initFromStorage()

// 计算属性
const isLoggedIn = computed(() => !!token.value)
const isAdmin = computed(() => currentUser.value?.role === 'admin')
const isVIPTeacher = computed(() => currentUser.value?.role === 'vip_teacher')
const isTeacher = computed(() => currentUser.value?.role === 'teacher' || currentUser.value?.role === 'vip_teacher')
const isStudent = computed(() => currentUser.value?.role === 'student')
const userName = computed(() => currentUser.value?.name || '未登录')
const userRole = computed(() => currentUser.value?.role || '')

// 登录
function login(phone: string, password: string): { success: boolean; message: string } {
  const result = mockLogin(phone, password)
  if (result.success && result.user) {
    currentUser.value = result.user
    token.value = `mock_token_${result.user.id}_${Date.now()}`
    uni.setStorageSync('currentUser', result.user)
    uni.setStorageSync('token', token.value)
    return { success: true, message: '登录成功' }
  }
  return { success: false, message: result.message }
}

// 退出
function logout() {
  currentUser.value = null
  token.value = ''
  uni.removeStorageSync('currentUser')
  uni.removeStorageSync('token')
  // #ifdef MP-WEIXIN
  uni.reLaunch({ url: '/pages/login/login' })
  // #endif
  // #ifdef APP-ANDROID
  uni.reLaunch({ url: '/pages/login/login' })
  // #endif
}

// 快速登录（演示账号）
function quickLogin(index: number): { success: boolean; message: string } {
  const account = DEMO_ACCOUNTS[index]
  if (account) {
    return login(account.phone, account.password)
  }
  return { success: false, message: '账号不存在' }
}

// 获取用户信息
function getUserInfo(): User | null {
  return currentUser.value
}

export function useUserStore() {
  return {
    currentUser,
    token,
    isLoggedIn,
    isAdmin,
    isVIPTeacher,
    isTeacher,
    isStudent,
    userName,
    userRole,
    login,
    logout,
    quickLogin,
    getUserInfo
  }
}