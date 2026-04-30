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
