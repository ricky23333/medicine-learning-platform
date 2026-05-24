import request from '@/utils/request'

// ========== 标本管理 ==========
// 分页查询标本列表
export function listSpecimen(query) {
  return request({
    url: '/admin/specimen/list',
    method: 'get',
    params: query
  })
}

// 查询单个标本
export function getSpecimen(specimenId) {
  return request({
    url: '/admin/specimen/' + specimenId,
    method: 'get'
  })
}

// 新增标本
export function addSpecimen(data) {
  return request({
    url: '/admin/specimen',
    method: 'post',
    data: data
  })
}

// 更新标本
export function updateSpecimen(data) {
  return request({
    url: '/admin/specimen',
    method: 'put',
    data: data
  })
}

// 删除标本
export function delSpecimen(specimenIds) {
  return request({
    url: '/admin/specimen/' + specimenIds,
    method: 'delete'
  })
}

// ========== 标本图片管理 ==========
// 上传标本图片 (multipart/form-data)
export function uploadSpecimenImage(formData) {
  return request({
    url: '/admin/specimen/image',
    method: 'post',
    data: formData
  })
}

// 删除标本图片
export function delSpecimenImage(imageId) {
  return request({
    url: '/admin/specimen/image/' + imageId,
    method: 'delete'
  })
}

// 审核图片
export function auditSpecimenImage(data) {
  return request({
    url: '/admin/specimen/image/audit',
    method: 'post',
    data: data
  })
}

// 修改图片备注
export function updateImageRemark(data) {
  return request({
    url: '/admin/specimen/image/remark',
    method: 'put',
    data: data
  })
}
