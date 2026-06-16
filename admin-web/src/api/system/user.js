import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/mei-mei'

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: '/system/user/' + parseStrEmpty(userId),
    method: 'get'
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/system/user',
    method: 'post',
    data: data
  })
}

// 修改用户
export function updateUser(data) {
  return request({
    url: '/system/user',
    method: 'put',
    data: data
  })
}

// 删除用户
export function delUser(userId) {
  return request({
    url: '/system/user/' + userId,
    method: 'delete'
  })
}

// 用户密码重置
export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password
  }
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data: data
  })
}

// 用户状态修改
export function changeUserStatus(userId, status, userIds) {
  const data = {
    userId,
    userIds,
    status
  }
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data: data
  })
}

// 查询用户个人信息
export function getUserProfile() {
  return request({
    url: '/system/user/profile',
    method: 'get'
  })
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data: data
  })
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  }
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    params: data
  })
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: data
  })
}

// 查询授权角色
export function getAuthRole(userId) {
  return request({
    url: '/system/user/authRole/' + userId,
    method: 'get'
  })
}

// 保存授权角色
export function updateAuthRole(data) {
  return request({
    url: '/system/user/authRole',
    method: 'put',
    params: data
  })
}

// 查询部门下拉树结构
export function deptTreeSelect() {
  return request({
    url: '/system/user/deptTree',
    method: 'get'
  })
}

// 查询组织下所有用户的专业年级
export function getMajorGrades(deptId) {
  return request({
    url: '/system/user/majorGrades',
    method: 'get',
    params: { deptId }
  })
}

//获取用户表格设置
export function getTableConfig(params) {
  return request({
    url: '/system/table',
    method: 'get',
    params
  })
}

//添加或者编辑用户表格设置
export function addTableConfig(data) {
  return request({
    url: '/system/table',
    method: 'post',
    data
  })
}

//重置用户表格设置
export function deleteTableConfig(params) {
  return request({
    url: '/system/table',
    method: 'delete',
    params
  })
}

// 升级用户为VIP
export function upgradeToVip(userId) {
  return request({
    url: '/admin/appUser/vipAudit/approve',
    method: 'post',
    params: { userId }
  })
}

// 批量启用用户
export function enableUser(userIds) {
  return request({
    url: '/system/user/enable',
    method: 'put',
    data: userIds
  })
}

// 批量停用用户
export function disableUser(userIds) {
  return request({
    url: '/system/user/disable',
    method: 'put',
    data: userIds
  })
}
