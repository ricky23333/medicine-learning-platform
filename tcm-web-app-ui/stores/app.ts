/**
 * 应用全局状态管理
 * 管理标本馆、标本、用户等数据
 */

import { ref } from 'vue'
import type { Museum, Specimen, User, VIPApplication, RegistrationApplication, ExamRecord } from '@/utils/mock'
import { MUSEUMS, SPECIMENS, USERS, VIP_APPLICATIONS, REGISTRATION_APPLICATIONS, VISIT_DATA, SYSTEM_STATS } from '@/utils/mock'

// 状态
const museums = ref<Museum[]>([...MUSEUMS])
const specimens = ref<Specimen[]>([...SPECIMENS])
const users = ref<User[]>([...USERS])
const vipApplications = ref<VIPApplication[]>([...VIP_APPLICATIONS])
const registrationApplications = ref<RegistrationApplication[]>([...REGISTRATION_APPLICATIONS])
const visitData = ref(VISIT_DATA)
const systemStats = ref(SYSTEM_STATS)

// 获取待审核数量
function getPendingReviewCount(): number {
  return vipApplications.value.filter(v => v.status === 'pending').length +
    registrationApplications.value.filter(r => r.status === 'pending').length +
    specimens.value.reduce((acc, s) => acc + s.images.filter(i => i.status === 'pending').length, 0)
}

// ---- 标本馆管理 ----

function addMuseum(museum: Omit<Museum, 'id' | 'createdAt'>) {
  museums.value.push({
    ...museum,
    id: Math.max(...museums.value.map(m => m.id), 0) + 1,
    createdAt: new Date().toISOString()
  })
}

function updateMuseum(id: number, updates: Partial<Museum>) {
  const index = museums.value.findIndex(m => m.id === id)
  if (index !== -1) {
    museums.value[index] = { ...museums.value[index], ...updates }
  }
}

function deleteMuseum(id: number) {
  museums.value = museums.value.filter(m => m.id !== id)
  // 同时删除关联的标本
  specimens.value = specimens.value.filter(s => s.museumId !== id)
}

function addCategory(museumId: number, category: Omit<import('@/utils/mock').Category, 'id' | 'museumId'>) {
  const museum = museums.value.find(m => m.id === museumId)
  if (museum) {
    const newId = Math.max(...museum.categories.map(c => c.id), 0) + 1
    museum.categories.push({ ...category, id: newId, museumId })
  }
}

function updateCategory(museumId: number, categoryId: number, updates: Partial<import('@/utils/mock').Category>) {
  const museum = museums.value.find(m => m.id === museumId)
  if (museum) {
    const index = museum.categories.findIndex(c => c.id === categoryId)
    if (index !== -1) {
      museum.categories[index] = { ...museum.categories[index], ...updates }
    }
  }
}

function deleteCategory(museumId: number, categoryId: number) {
  const museum = museums.value.find(m => m.id === museumId)
  if (museum) {
    museum.categories = museum.categories.filter(c => c.id !== categoryId)
    // 同时删除关联的标本
    specimens.value = specimens.value.filter(s => s.categoryId !== categoryId)
  }
}

// ---- 标本管理 ----

function addSpecimen(specimen: Omit<Specimen, 'id' | 'createdAt'>) {
  specimens.value.push({
    ...specimen,
    id: Math.max(...specimens.value.map(s => s.id), 0) + 1,
    createdAt: new Date().toISOString()
  })
}

function updateSpecimen(id: number, updates: Partial<Specimen>) {
  const index = specimens.value.findIndex(s => s.id === id)
  if (index !== -1) {
    specimens.value[index] = { ...specimens.value[index], ...updates }
  }
}

function deleteSpecimen(id: number) {
  specimens.value = specimens.value.filter(s => s.id !== id)
}

// ---- 标本图片管理 ----

function addSpecimenImage(specimenId: number, image: Omit<import('@/utils/mock').SpecimenImage, 'id' | 'specimenId'>) {
  const specimen = specimens.value.find(s => s.id === specimenId)
  if (specimen) {
    const newId = Math.max(...specimen.images.map(i => i.id), 0) + 1
    specimen.images.push({ ...image, id: newId, specimenId })
  }
}

function approveImage(specimenId: number, imageId: number) {
  const specimen = specimens.value.find(s => s.id === specimenId)
  if (specimen) {
    const image = specimen.images.find(i => i.id === imageId)
    if (image) image.status = 'approved'
  }
}

function rejectImage(specimenId: number, imageId: number) {
  const specimen = specimens.value.find(s => s.id === specimenId)
  if (specimen) {
    const image = specimen.images.find(i => i.id === imageId)
    if (image) image.status = 'rejected'
  }
}

function deleteImage(specimenId: number, imageId: number) {
  const specimen = specimens.value.find(s => s.id === specimenId)
  if (specimen) {
    specimen.images = specimen.images.filter(i => i.id !== imageId)
  }
}

// ---- 用户管理 ----

function addUser(user: Omit<User, 'id' | 'createdAt'>) {
  users.value.push({
    ...user,
    id: Math.max(...users.value.map(u => u.id), 0) + 1,
    createdAt: new Date().toISOString()
  })
}

function updateUser(id: number, updates: Partial<User>) {
  const index = users.value.findIndex(u => u.id === id)
  if (index !== -1) {
    users.value[index] = { ...users.value[index], ...updates }
  }
}

function deleteUser(id: number) {
  users.value = users.value.filter(u => u.id !== id)
}

// ---- 审核管理 ----

function approveVIP(applicationId: number) {
  const app = vipApplications.value.find(v => v.id === applicationId)
  if (app) {
    app.status = 'approved'
    const user = users.value.find(u => u.id === app.userId)
    if (user) {
      user.vipStatus = 'approved'
      user.role = 'vip_teacher'
    }
  }
}

function rejectVIP(applicationId: number) {
  const app = vipApplications.value.find(v => v.id === applicationId)
  if (app) {
    app.status = 'rejected'
  }
}

function approveRegistration(applicationId: number) {
  const app = registrationApplications.value.find(r => r.id === applicationId)
  if (app) {
    app.status = 'approved'
    // 创建新用户
    addUser({
      name: app.name,
      phone: app.phone,
      role: app.role,
      status: 'active',
      unit: app.unit,
      studentId: app.studentId,
      major: app.major,
      contact: app.contact,
      vipStatus: 'none',
      firstLogin: true
    })
  }
}

function rejectRegistration(applicationId: number) {
  const app = registrationApplications.value.find(r => r.id === applicationId)
  if (app) {
    app.status = 'rejected'
  }
}

// ---- 统计 ----

function getCategoryStats() {
  const stats: { name: string; count: number; color: string }[] = []
  museums.value.forEach((m, mi) => {
    m.categories.forEach((c, ci) => {
      const colors = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc', '#f0f4f0']
      stats.push({
        name: c.name,
        count: c.specimenCount || 0,
        color: colors[(mi * 3 + ci) % colors.length]
      })
    })
  })
  return stats
}

export function useAppStore() {
  return {
    // 状态
    museums,
    specimens,
    users,
    vipApplications,
    registrationApplications,
    visitData,
    systemStats,

    // 方法
    getPendingReviewCount,
    addMuseum,
    updateMuseum,
    deleteMuseum,
    addCategory,
    updateCategory,
    deleteCategory,
    addSpecimen,
    updateSpecimen,
    deleteSpecimen,
    addSpecimenImage,
    approveImage,
    rejectImage,
    deleteImage,
    addUser,
    updateUser,
    deleteUser,
    approveVIP,
    rejectVIP,
    approveRegistration,
    rejectRegistration,
    getCategoryStats
  }
}