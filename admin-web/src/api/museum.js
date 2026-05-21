import request from '@/utils/request'

// ========== 馆管理 ==========
// 查询馆列表（分页）
export function listMuseum(query) {
  return request({
    url: '/admin/museum/list',
    method: 'get',
    params: query
  })
}

// 查询所有馆（带分类）
export function getMuseumAll() {
  return request({
    url: '/admin/museum/all',
    method: 'get'
  })
}

// 查询馆详情
export function getMuseum(museumId) {
  return request({
    url: '/admin/museum/' + museumId,
    method: 'get'
  })
}

// 新增馆
export function addMuseum(data) {
  return request({
    url: '/admin/museum',
    method: 'post',
    data: data
  })
}

// 修改馆
export function updateMuseum(data) {
  return request({
    url: '/admin/museum',
    method: 'put',
    data: data
  })
}

// 更新馆启用状态
export function updateMuseumEnabled(data) {
  return request({
    url: '/admin/museum/enabled',
    method: 'put',
    data: data
  })
}

// 删除馆
export function delMuseum(museumIds) {
  return request({
    url: '/admin/museum/' + museumIds,
    method: 'delete'
  })
}

// ========== 分类管理 ==========
// 查询分类列表（分页）
export function listCategory(query) {
  return request({
    url: '/admin/category/list',
    method: 'get',
    params: query
  })
}

// 查询分类详情
export function getCategory(categoryId) {
  return request({
    url: '/admin/category/' + categoryId,
    method: 'get'
  })
}

// 新增分类
export function addCategory(data) {
  return request({
    url: '/admin/category',
    method: 'post',
    data: data
  })
}

// 修改分类
export function updateCategory(data) {
  return request({
    url: '/admin/category',
    method: 'put',
    data: data
  })
}

// 删除分类
export function delCategory(categoryIds) {
  return request({
    url: '/admin/category/' + categoryIds,
    method: 'delete'
  })
}
