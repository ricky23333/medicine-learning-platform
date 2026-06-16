import request from '@/utils/request'

// ========== 系统统计 ==========
// 获取系统概况
export function getStatsOverview() {
  return request({
    url: '/admin/stats/overview',
    method: 'get'
  })
}

// 获取访问量折线图数据
export function getStatsVisitChart(days) {
  return request({
    url: '/admin/stats/visitChart',
    method: 'get',
    params: { days }
  })
}

// 获取公共系统基础信息概览
export function getPublicStats() {
  return request({
    url: '/public/stats/summary',
    method: 'get',
  })
}

// 获取学校统计数据
export function getSchoolStats(params) {
  return request({
    url: '/admin/stats/schoolStats',
    method: 'get',
    params
  })
}

// 导出学生成绩
export function exportStudentScores(params) {
  return request({
    url: '/admin/stats/exportStudentScores',
    method: 'post',
    params,
    responseType: 'blob'
  })
}
