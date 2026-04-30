import request from '@/utils/request'

// ========== 注册审核 ==========
// 获取待审核注册列表
export function listRegisterAudit(query) {
  return request({
    url: '/admin/appUser/registerAudit',
    method: 'get',
    params: query
  })
}

// 通过注册
export function approveRegister(userId) {
  return request({
    url: '/admin/appUser/registerAudit/approve',
    method: 'post',
    params: { userId }
  })
}

// 拒绝注册
export function rejectRegister(userId) {
  return request({
    url: '/admin/appUser/registerAudit/reject',
    method: 'post',
    params: { userId }
  })
}

// ========== VIP审核 ==========
// 获取VIP申请列表
export function listVipAudit(query) {
  return request({
    url: '/admin/appUser/vipAudit',
    method: 'get',
    params: query
  })
}

// 通过VIP申请
export function approveVip(userId) {
  return request({
    url: '/admin/appUser/vipAudit/approve',
    method: 'post',
    params: { userId }
  })
}

// 拒绝VIP申请
export function rejectVip(userId) {
  return request({
    url: '/admin/appUser/vipAudit/reject',
    method: 'post',
    params: { userId }
  })
}

// ========== 图片审核 ==========
// 审核图片
export function auditImage(data) {
  return request({
    url: '/admin/specimen/image/audit',
    method: 'post',
    data: data
  })
}