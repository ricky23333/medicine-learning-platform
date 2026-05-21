import request from '@/utils/request'

// 查询意见反馈列表
export function listFeedback(query) {
  return request({
    url: '/admin/feedback/list',
    method: 'get',
    params: query
  })
}

// 查询意见反馈详情
export function getFeedback(feedbackId) {
  return request({
    url: '/admin/feedback/' + feedbackId,
    method: 'get'
  })
}

// 删除意见反馈
export function delFeedback(feedbackIds) {
  return request({
    url: '/admin/feedback/' + feedbackIds,
    method: 'delete'
  })
}