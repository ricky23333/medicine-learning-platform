import request from '@/utils/request'

// 获取系统概况
export function getStatsOverview() {
  return request({ url: '/admin/stats/overview', method: 'get' })
}

// 获取访问量图表数据
export function getVisitChart(days) {
  return request({ url: '/admin/stats/visitChart', method: 'get', params: { days } })
}

// 获取所有馆（带分类）
export function getMuseumAll() {
  return request({ url: '/admin/museum/all', method: 'get' })
}

// 获取标本列表
export function getSpecimenList(query) {
  return request({ url: '/admin/specimen/list', method: 'get', params: query })
}

// 获取待审核注册列表
export function getRegisterAuditList(query) {
  return request({ url: '/admin/appUser/registerAudit', method: 'get', params: query })
}

// 获取VIP申请列表
export function getVipAuditList(query) {
  return request({ url: '/admin/appUser/vipAudit', method: 'get', params: query })
}

// 获取用户列表
export function getAppUserList(query) {
  return request({ url: '/admin/appUser/list', method: 'get', params: query })
}
