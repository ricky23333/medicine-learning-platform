/**
 * 模拟数据 - 用于开发阶段
 * 当后端 API 不可用时使用
 */

// ---- 类型定义 ----

export type UserRole = 'student' | 'teacher' | 'vip_teacher' | 'admin'
export type UserStatus = 'pending' | 'active' | 'suspended'
export type VIPStatus = 'none' | 'pending' | 'approved'
export type ImageStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: number
  name: string
  phone: string
  password?: string
  role: UserRole
  status: UserStatus
  unit: string
  studentId?: string
  major?: string
  contact?: string
  vipStatus: VIPStatus
  firstLogin: boolean
  createdAt: string
  avatar?: string
}

export interface Category {
  id: number
  museumId: number
  name: string
  description?: string
  specimenCount?: number
}

export interface Museum {
  id: number
  name: string
  description: string
  icon: string
  categories: Category[]
  createdAt: string
}

export interface SpecimenImage {
  id: number
  specimenId: number
  url: string
  uploadedBy: number
  uploadedByName: string
  uploadedAt: string
  status: ImageStatus
}

export interface Specimen {
  id: number
  museumId: number
  categoryId: number
  name: string
  latinName?: string
  images: SpecimenImage[]
  notes: string
  properties?: string
  createdAt: string
  createdBy: number
}

export interface ExamQuestion {
  id: number
  specimenId: number
  specimenName: string
  imageUrl: string
  correctAnswer: string
  userAnswer?: string
  isCorrect?: boolean
}

export interface ExamRecord {
  id: number
  userId: number
  userName: string
  museumId: number
  museumName: string
  categoryIds: number[]
  questions: ExamQuestion[]
  score: number
  totalQuestions: number
  submittedAt: string
}

export interface VIPApplication {
  id: number
  userId: number
  userName: string
  phone: string
  unit: string
  reason: string
  appliedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface RegistrationApplication {
  id: number
  name: string
  phone: string
  role: UserRole
  unit: string
  studentId?: string
  major?: string
  contact?: string
  appliedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface VisitData {
  date: string
  visits: number
  users: number
}

// ---- 模拟数据 ----

export const MUSEUMS: Museum[] = [
  {
    id: 1,
    name: '中药材馆',
    description: '收藏各类中药材标本，涵盖动物、植物、矿物三大类',
    icon: '🌿',
    createdAt: '2024-01-01',
    categories: [
      { id: 1, museumId: 1, name: '植物类', description: '中药植物标本', specimenCount: 8 },
      { id: 2, museumId: 1, name: '动物类', description: '中药动物标本', specimenCount: 4 },
      { id: 3, museumId: 1, name: '矿物类', description: '中药矿物标本', specimenCount: 2 }
    ]
  },
  {
    id: 2,
    name: '药用植物馆',
    description: '展示药用植物原植物形态与生态',
    icon: '🌱',
    createdAt: '2024-01-15',
    categories: [
      { id: 4, museumId: 2, name: '草本植物', description: '草本类药材', specimenCount: 6 },
      { id: 5, museumId: 2, name: '木本植物', description: '木本类药材', specimenCount: 5 },
      { id: 6, museumId: 2, name: '藤本植物', description: '藤本类药材', specimenCount: 3 }
    ]
  }
]

export const SPECIMENS: Specimen[] = [
  {
    id: 1,
    museumId: 1,
    categoryId: 1,
    name: '人参',
    latinName: 'Panax ginseng',
    images: [
      { id: 1, specimenId: 1, url: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400', uploadedBy: 1, uploadedByName: '张老师', uploadedAt: '2024-02-01', status: 'approved' },
      { id: 2, specimenId: 1, url: 'https://images.unsplash.com/photo-1577466803330-f0e2eb5b6e61?w=400', uploadedBy: 2, uploadedByName: '李老师', uploadedAt: '2024-02-02', status: 'pending' }
    ],
    notes: '多年生草本，根入药，具有大补元气、复脉固脱等功效',
    properties: '性温，味甘、微苦',
    createdAt: '2024-01-20',
    createdBy: 1
  },
  {
    id: 2,
    museumId: 1,
    categoryId: 1,
    name: '黄芪',
    latinName: 'Astragalus membranaceus',
    images: [
      { id: 3, specimenId: 2, url: 'https://images.unsplash.com/photo-1626078439536-13f5a4f0e6d2?w=400', uploadedBy: 1, uploadedByName: '张老师', uploadedAt: '2024-02-03', status: 'approved' }
    ],
    notes: '豆科植物，根部入药，具有补气升阳、利水消肿等功效',
    properties: '性微温，味甘',
    createdAt: '2024-01-21',
    createdBy: 1
  },
  {
    id: 3,
    museumId: 1,
    categoryId: 1,
    name: '当归',
    latinName: 'Angelica sinensis',
    images: [
      { id: 4, specimenId: 3, url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400', uploadedBy: 1, uploadedByName: '张老师', uploadedAt: '2024-02-04', status: 'approved' }
    ],
    notes: '伞形科植物，根入药，具有补血活血、调经止痛等功效',
    properties: '性温，味甘、辛',
    createdAt: '2024-01-22',
    createdBy: 1
  },
  {
    id: 4,
    museumId: 1,
    categoryId: 2,
    name: '鹿茸',
    latinName: 'Cervus cornu',
    images: [
      { id: 5, specimenId: 4, url: 'https://images.unsplash.com/photo-1607613009825-9d0c5d7f2b1e?w=400', uploadedBy: 1, uploadedByName: '张老师', uploadedAt: '2024-02-05', status: 'approved' }
    ],
    notes: '梅花鹿或马鹿的未骨化幼角',
    properties: '性温，味咸',
    createdAt: '2024-01-23',
    createdBy: 1
  },
  {
    id: 5,
    museumId: 2,
    categoryId: 4,
    name: '金银花',
    latinName: 'Lonicera japonica',
    images: [
      { id: 6, specimenId: 5, url: 'https://images.unsplash.com/photo-1597575173923-5a2b7c07c2a7?w=400', uploadedBy: 2, uploadedByName: '李老师', uploadedAt: '2024-02-06', status: 'approved' }
    ],
    notes: '忍冬科植物，花入药，具有清热解毒、疏散风热功效',
    properties: '性寒，味甘',
    createdAt: '2024-01-24',
    createdBy: 2
  },
  {
    id: 6,
    museumId: 2,
    categoryId: 4,
    name: '板蓝根',
    latinName: 'Isatis indigotica',
    images: [
      { id: 7, specimenId: 6, url: 'https://images.unsplash.com/photo-1611241893603-3c3c07a7e5e5?w=400', uploadedBy: 2, uploadedByName: '李老师', uploadedAt: '2024-02-07', status: 'pending' }
    ],
    notes: '十字花科植物，根入药，具有清热解毒、凉血利咽功效',
    properties: '性寒，味苦',
    createdAt: '2024-01-25',
    createdBy: 2
  }
]

export const USERS: User[] = [
  { id: 1, name: '管理员', phone: '13800138000', role: 'admin', status: 'active', unit: '系统管理', vipStatus: 'none', firstLogin: false, createdAt: '2024-01-01' },
  { id: 2, name: '张老师', phone: '13800138001', role: 'vip_teacher', status: 'active', unit: '中医药大学', vipStatus: 'approved', firstLogin: false, createdAt: '2024-01-02' },
  { id: 3, name: '李老师', phone: '13800138002', role: 'vip_teacher', status: 'active', unit: '中医药大学', vipStatus: 'approved', firstLogin: false, createdAt: '2024-01-03' },
  { id: 4, name: '王老师', phone: '13800138003', role: 'teacher', status: 'active', unit: '中医药大学', vipStatus: 'none', firstLogin: false, createdAt: '2024-01-04' },
  { id: 5, name: '陈老师', phone: '13800138004', role: 'teacher', status: 'active', unit: '中医药大学', vipStatus: 'none', firstLogin: false, createdAt: '2024-01-05' },
  { id: 6, name: '学生张三', phone: '13900139001', role: 'student', status: 'active', unit: '中医药大学', studentId: '2024001', major: '中药学', vipStatus: 'none', firstLogin: false, createdAt: '2024-01-10' },
  { id: 7, name: '学生李四', phone: '13900139002', role: 'student', status: 'active', unit: '中医药大学', studentId: '2024002', major: '中医学', vipStatus: 'none', firstLogin: false, createdAt: '2024-01-11' },
  { id: 8, name: '学生王五', phone: '13900139003', role: 'student', status: 'pending', unit: '中医药大学', studentId: '2024003', major: '针灸推拿学', vipStatus: 'none', firstLogin: true, createdAt: '2024-02-01' }
]

export const VIP_APPLICATIONS: VIPApplication[] = [
  { id: 1, userId: 6, userName: '学生张三', phone: '13900139001', unit: '中医药大学', reason: '希望深入学习中药鉴定知识', appliedAt: '2024-02-01', status: 'pending' },
  { id: 2, userId: 7, userName: '学生李四', phone: '13900139002', unit: '中医药大学', reason: '对药用植物有浓厚兴趣', appliedAt: '2024-02-02', status: 'pending' }
]

export const REGISTRATION_APPLICATIONS: RegistrationApplication[] = [
  { id: 1, name: '赵六', phone: '13900139004', role: 'student', unit: '中医药大学', studentId: '2024004', major: '中药学', appliedAt: '2024-02-03', status: 'pending' },
  { id: 2, name: '钱七', phone: '13900139005', role: 'student', unit: '中医药大学', studentId: '2024005', major: '中医学', appliedAt: '2024-02-04', status: 'pending' },
  { id: 3, name: '孙八', phone: '13900139006', role: 'teacher', unit: '中医药大学', contact: 'sun@example.com', appliedAt: '2024-02-05', status: 'pending' }
]

// 生成最近30天的访问数据
function generateVisitData() {
  const data: VisitData[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      visits: Math.floor(Math.random() * 200) + 50,
      users: Math.floor(Math.random() * 50) + 20
    })
  }
  return data
}

export const VISIT_DATA = generateVisitData()

export const SYSTEM_STATS = {
  totalVisits: 12580,
  totalUsers: 156,
  totalSpecimens: 48,
  totalExams: 342
}

// ---- 模拟登录验证 ----

export function mockLogin(phone: string, password: string): { success: boolean; message: string; user?: User } {
  const user = USERS.find(u => u.phone === phone)
  if (!user) {
    return { success: false, message: '用户不存在' }
  }
  // 简化的密码验证，实际应该加密比对
  if (password !== '123456' && password !== user.password) {
    return { success: false, message: '密码错误' }
  }
  return { success: true, message: '登录成功', user }
}

// 获取演示账号
export const DEMO_ACCOUNTS = [
  { name: '管理员', phone: '13800138000', password: '123456', role: 'admin' },
  { name: '张老师', phone: '13800138001', password: '123456', role: 'vip_teacher' },
  { name: '李老师', phone: '13800138002', password: '123456', role: 'vip_teacher' },
  { name: '学生张三', phone: '13900139001', password: '123456', role: 'student' }
]