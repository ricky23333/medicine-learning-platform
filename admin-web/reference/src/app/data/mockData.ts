import type {
  Museum, Specimen, User, ExamRecord, VIPApplication,
  RegistrationApplication, VisitData
} from './types';

const IMG = {
  root1: 'https://images.unsplash.com/photo-1681390367146-91e574fc6b7d?w=600&q=80',
  ginseng: 'https://images.unsplash.com/photo-1695798790639-c3c4294373ab?w=600&q=80',
  chrysanthemum: 'https://images.unsplash.com/photo-1739792168508-56764cefd461?w=600&q=80',
  cinnamon: 'https://images.unsplash.com/photo-1759141936083-d10203b4d4f6?w=600&q=80',
  wolfberry: 'https://images.unsplash.com/photo-1653989451597-21b2fa4036bf?w=600&q=80',
  angelica: 'https://images.unsplash.com/photo-1630047031826-09f80b9a2dca?w=600&q=80',
  astragalus: 'https://images.unsplash.com/photo-1723143682414-e1c19ce9cd9b?w=600&q=80',
  honeysuckle: 'https://images.unsplash.com/photo-1758389145809-8dea72204b37?w=600&q=80',
  tangerinePeel: 'https://images.unsplash.com/photo-1742845870776-80f6f8e9d159?w=600&q=80',
  salvia: 'https://images.unsplash.com/photo-1752604230966-2f59b62922c7?w=600&q=80',
  licorice: 'https://images.unsplash.com/photo-1689394763969-6dc5475f4a8c?w=600&q=80',
  lotus: 'https://images.unsplash.com/photo-1727830644210-8e03ac4ea6cd?w=600&q=80',
};

export const MUSEUMS: Museum[] = [
  {
    id: 'museum-1',
    name: '中药材（饮片）馆',
    description: '收录常见中药饮片标本，包括根及根茎类、皮类、花类等各类饮片标本。',
    icon: '🌿',
    createdAt: '2024-01-01',
    categories: [
      { id: 'cat-1-1', museumId: 'museum-1', name: '根及根茎类', description: '以植物根部或根茎入药的中药材', specimenCount: 7 },
      { id: 'cat-1-2', museumId: 'museum-1', name: '皮类', description: '以植物树皮或果皮入药的中药材', specimenCount: 3 },
      { id: 'cat-1-3', museumId: 'museum-1', name: '花类', description: '以植物花朵入药的中药材', specimenCount: 4 },
      { id: 'cat-1-4', museumId: 'museum-1', name: '果实及种子类', description: '以植物果实或种子入药的中药材', specimenCount: 5 },
      { id: 'cat-1-5', museumId: 'museum-1', name: '叶类', description: '以植物叶片入药的中药材', specimenCount: 3 },
      { id: 'cat-1-6', museumId: 'museum-1', name: '全草类', description: '以植物全株入药的中药材', specimenCount: 4 },
      { id: 'cat-1-7', museumId: 'museum-1', name: '菌藻类', description: '以真菌或藻类入药的中药材', specimenCount: 2 },
      { id: 'cat-1-8', museumId: 'museum-1', name: '矿物类', description: '以矿物质入药的中药材', specimenCount: 2 },
    ],
  },
  {
    id: 'museum-2',
    name: '药用植物馆',
    description: '收录常见药用植物活体标本及腊叶标本，展示植物形态特征。',
    icon: '🌱',
    createdAt: '2024-03-01',
    categories: [
      { id: 'cat-2-1', museumId: 'museum-2', name: '被子植物', description: '具有花朵和果实的高等植物', specimenCount: 8 },
      { id: 'cat-2-2', museumId: 'museum-2', name: '裸子植物', description: '种子裸露、不被果皮包被的植物', specimenCount: 3 },
      { id: 'cat-2-3', museumId: 'museum-2', name: '蕨类植物', description: '以孢子繁殖的维管植物', specimenCount: 2 },
    ],
  },
];

export const SPECIMENS: Specimen[] = [
  // 根及根茎类
  {
    id: 'sp-1', museumId: 'museum-1', categoryId: 'cat-1-1', name: '人参',
    latinName: 'Panax ginseng C. A. Mey.',
    images: [
      { id: 'img-1-1', specimenId: 'sp-1', url: IMG.ginseng, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-15', status: 'approved' },
      { id: 'img-1-2', specimenId: 'sp-1', url: IMG.root1, uploadedBy: 'user-3', uploadedByName: '张教授', uploadedAt: '2024-02-10', status: 'approved' },
    ],
    notes: '人参为五加科植物人参的干燥根和根茎。味甘、微苦，性微温。归脾、肺、心、肾经。功效：大补元气，复脉固脱，补脾益肺，生津养血，安神益智。',
    properties: '性微温，味甘微苦',
    createdAt: '2024-01-15', createdBy: 'user-admin',
  },
  {
    id: 'sp-2', museumId: 'museum-1', categoryId: 'cat-1-1', name: '白芷',
    latinName: 'Angelica dahurica (Fisch. ex Hoffm.) Benth. et Hook. f.',
    images: [
      { id: 'img-2-1', specimenId: 'sp-2', url: IMG.angelica, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-15', status: 'approved' },
    ],
    notes: '白芷为伞形科植物白芷或杭白芷的干燥根。味辛，性温。归胃、大肠、肺经。功效：解表散寒，祛风止痛，宣通鼻窍，燥湿止带，消肿排脓。',
    properties: '性温，味辛',
    createdAt: '2024-01-15', createdBy: 'user-admin',
  },
  {
    id: 'sp-3', museumId: 'museum-1', categoryId: 'cat-1-1', name: '黄芪',
    latinName: 'Astragalus membranaceus (Fisch.) Bge.',
    images: [
      { id: 'img-3-1', specimenId: 'sp-3', url: IMG.astragalus, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-15', status: 'approved' },
    ],
    notes: '黄芪为豆科植物蒙古黄芪或膜荚黄芪的干燥根。味甘，性微温。归肺、脾经。功效：补气升阳，固表止汗，利水消肿，生津养血，行滞通痹，托毒排脓，敛疮生肌。',
    properties: '性微温，味甘',
    createdAt: '2024-01-20', createdBy: 'user-admin',
  },
  {
    id: 'sp-4', museumId: 'museum-1', categoryId: 'cat-1-1', name: '甘草',
    latinName: 'Glycyrrhiza uralensis Fisch.',
    images: [
      { id: 'img-4-1', specimenId: 'sp-4', url: IMG.licorice, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-20', status: 'approved' },
    ],
    notes: '甘草为豆科植物甘草的干燥根和根茎。味甘，性平。归心、肺、脾、胃经。功效：补脾益气，清热解毒，祛痰止咳，缓急止痛，调和诸药。',
    properties: '性平，味甘',
    createdAt: '2024-01-20', createdBy: 'user-admin',
  },
  {
    id: 'sp-5', museumId: 'museum-1', categoryId: 'cat-1-1', name: '丹参',
    latinName: 'Salvia miltiorrhiza Bge.',
    images: [
      { id: 'img-5-1', specimenId: 'sp-5', url: IMG.salvia, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-25', status: 'approved' },
    ],
    notes: '丹参为唇形科植物丹参的干燥根和根茎。味苦，性微寒。归心、肝经。功效：活血祛瘀，通经止痛，清心除烦，凉血消痈。',
    properties: '性微寒，味苦',
    createdAt: '2024-01-25', createdBy: 'user-admin',
  },
  {
    id: 'sp-6', museumId: 'museum-1', categoryId: 'cat-1-1', name: '当归',
    latinName: 'Angelica sinensis (Oliv.) Diels',
    images: [
      { id: 'img-6-1', specimenId: 'sp-6', url: IMG.root1, uploadedBy: 'user-3', uploadedByName: '张教授', uploadedAt: '2024-02-01', status: 'approved' },
    ],
    notes: '当归为伞形科植物当归的干燥根。味甘、辛，性温。归肝、心、脾经。功效：补血活血，调经止痛，润肠通便。',
    properties: '性温，味甘辛',
    createdAt: '2024-02-01', createdBy: 'user-3',
  },
  {
    id: 'sp-7', museumId: 'museum-1', categoryId: 'cat-1-1', name: '川芎',
    latinName: 'Ligusticum chuanxiong Hort.',
    images: [
      { id: 'img-7-1', specimenId: 'sp-7', url: IMG.root1, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-02-05', status: 'approved' },
    ],
    notes: '川芎为伞形科植物川芎的干燥根茎。味辛，性温。归肝、胆、心包经。功效：活血行气，祛风止痛。',
    properties: '性温，味辛',
    createdAt: '2024-02-05', createdBy: 'user-admin',
  },
  // 皮类
  {
    id: 'sp-8', museumId: 'museum-1', categoryId: 'cat-1-2', name: '肉桂',
    latinName: 'Cinnamomum cassia Presl',
    images: [
      { id: 'img-8-1', specimenId: 'sp-8', url: IMG.cinnamon, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-15', status: 'approved' },
    ],
    notes: '肉桂为樟科植物肉桂的干燥树皮。味辛、甘，性大热。归肾、脾、心、肝经。功效：补火助阳，引火归元，散寒止痛，温通经脉。',
    properties: '性大热，味辛甘',
    createdAt: '2024-01-15', createdBy: 'user-admin',
  },
  {
    id: 'sp-9', museumId: 'museum-1', categoryId: 'cat-1-2', name: '陈皮',
    latinName: 'Citrus reticulata Blanco',
    images: [
      { id: 'img-9-1', specimenId: 'sp-9', url: IMG.tangerinePeel, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-20', status: 'approved' },
    ],
    notes: '陈皮为芸香科植物橘及其栽培变种的干燥成熟果皮。味苦、辛，性温。归肺、脾经。功效：理气健脾，燥湿化痰。',
    properties: '性温，味苦辛',
    createdAt: '2024-01-20', createdBy: 'user-admin',
  },
  {
    id: 'sp-10', museumId: 'museum-1', categoryId: 'cat-1-2', name: '厚朴',
    latinName: 'Magnolia officinalis Rehd. et Wils.',
    images: [
      { id: 'img-10-1', specimenId: 'sp-10', url: IMG.cinnamon, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-25', status: 'approved' },
    ],
    notes: '厚朴为木兰科植物厚朴或凹叶厚朴的干燥干皮、根皮及枝皮。味苦、辛，性温。归脾、胃、肺、大肠经。功效：燥湿消痰，下气除满。',
    properties: '性温，味苦辛',
    createdAt: '2024-01-25', createdBy: 'user-admin',
  },
  // 花类
  {
    id: 'sp-11', museumId: 'museum-1', categoryId: 'cat-1-3', name: '菊花',
    latinName: 'Chrysanthemum morifolium Ramat.',
    images: [
      { id: 'img-11-1', specimenId: 'sp-11', url: IMG.chrysanthemum, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-15', status: 'approved' },
    ],
    notes: '菊花为菊科植物菊的干燥头状花序。味甘、苦，性微寒。归肺、肝经。功效：散风清热，平肝明目，清热解毒。',
    properties: '性微寒，味甘苦',
    createdAt: '2024-01-15', createdBy: 'user-admin',
  },
  {
    id: 'sp-12', museumId: 'museum-1', categoryId: 'cat-1-3', name: '金银花',
    latinName: 'Lonicera japonica Thunb.',
    images: [
      { id: 'img-12-1', specimenId: 'sp-12', url: IMG.honeysuckle, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-20', status: 'approved' },
    ],
    notes: '金银花为忍冬科植物忍冬的干燥花蕾或带初开的花。味甘，性寒。归肺、心、胃经。功效：清热解毒，疏散风热。',
    properties: '性寒，味甘',
    createdAt: '2024-01-20', createdBy: 'user-admin',
  },
  {
    id: 'sp-13', museumId: 'museum-1', categoryId: 'cat-1-3', name: '红花',
    latinName: 'Carthamus tinctorius L.',
    images: [
      { id: 'img-13-1', specimenId: 'sp-13', url: IMG.salvia, uploadedBy: 'user-3', uploadedByName: '张教授', uploadedAt: '2024-02-15', status: 'approved' },
    ],
    notes: '红花为菊科植物红花的干燥花。味辛，性温。归心、肝经。功效：活血通经，散瘀止痛。',
    properties: '性温，味辛',
    createdAt: '2024-02-15', createdBy: 'user-3',
  },
  // 果实及种子类
  {
    id: 'sp-14', museumId: 'museum-1', categoryId: 'cat-1-4', name: '枸杞子',
    latinName: 'Lycium barbarum L.',
    images: [
      { id: 'img-14-1', specimenId: 'sp-14', url: IMG.wolfberry, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-15', status: 'approved' },
    ],
    notes: '枸杞子为茄科植物宁夏枸杞的干燥成熟果实。味甘，性平。归肝、肾经。功效：滋补肝肾，益精明目。',
    properties: '性平，味甘',
    createdAt: '2024-01-15', createdBy: 'user-admin',
  },
  {
    id: 'sp-15', museumId: 'museum-1', categoryId: 'cat-1-4', name: '莲子',
    latinName: 'Nelumbo nucifera Gaertn.',
    images: [
      { id: 'img-15-1', specimenId: 'sp-15', url: IMG.lotus, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-01-20', status: 'approved' },
    ],
    notes: '莲子为睡莲科植物莲的干燥成熟种子。味甘、涩，性平。归脾、肾、心经。功效：补脾止泻，止带，益肾涩精，养心安神。',
    properties: '性平，味甘涩',
    createdAt: '2024-01-20', createdBy: 'user-admin',
  },
  // 药用植物馆
  {
    id: 'sp-16', museumId: 'museum-2', categoryId: 'cat-2-1', name: '白芷',
    latinName: 'Angelica dahurica (Fisch. ex Hoffm.) Benth. et Hook. f.',
    images: [
      { id: 'img-16-1', specimenId: 'sp-16', url: IMG.angelica, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-03-10', status: 'approved' },
    ],
    notes: '药用植物馆标本。白芷为伞形科植物，多年生高大草本，高1-2.5米。茎中空，有纵沟纹，常带紫色。',
    properties: '伞形科，多年生草本',
    createdAt: '2024-03-10', createdBy: 'user-admin',
  },
  {
    id: 'sp-17', museumId: 'museum-2', categoryId: 'cat-2-1', name: '人参',
    latinName: 'Panax ginseng C. A. Mey.',
    images: [
      { id: 'img-17-1', specimenId: 'sp-17', url: IMG.ginseng, uploadedBy: 'user-admin', uploadedByName: '管理员', uploadedAt: '2024-03-15', status: 'approved' },
    ],
    notes: '药用植物馆标本。人参为五加科植物，多年生草本。根肉质，圆柱形或纺锤形。',
    properties: '五加科，多年生草本',
    createdAt: '2024-03-15', createdBy: 'user-admin',
  },
  // Pending specimens
  {
    id: 'sp-18', museumId: 'museum-1', categoryId: 'cat-1-3', name: '洋金花',
    latinName: 'Datura metel L.',
    images: [
      { id: 'img-18-1', specimenId: 'sp-18', url: IMG.chrysanthemum, uploadedBy: 'user-3', uploadedByName: '张教授', uploadedAt: '2024-04-01', status: 'pending' },
    ],
    notes: '洋金花为茄科植物白花曼陀罗的干燥花。味辛，性温；有毒。归肺、肝经。',
    properties: '性温，味辛；有毒',
    createdAt: '2024-04-01', createdBy: 'user-3',
  },
];

export const USERS: User[] = [
  {
    id: 'user-admin', name: '系统管理员', phone: '13800000001', password: 'admin2024',
    role: 'admin', status: 'active', unit: '中医药大学', vipStatus: 'none',
    firstLogin: false, createdAt: '2024-01-01',
  },
  {
    id: 'user-2', name: '李明教授', phone: '13800000002', password: '888888',
    role: 'vip_teacher', status: 'active', unit: '北京中医药大学', vipStatus: 'approved',
    firstLogin: false, createdAt: '2024-01-10', contact: '李明', avatar: undefined,
  },
  {
    id: 'user-3', name: '张教授', phone: '13800000003', password: 'teacher123',
    role: 'vip_teacher', status: 'active', unit: '上海中医药大学', vipStatus: 'approved',
    firstLogin: false, createdAt: '2024-01-12',
  },
  {
    id: 'user-4', name: '王丽老师', phone: '13800000004', password: '888888',
    role: 'teacher', status: 'active', unit: '广州中医药大学', vipStatus: 'pending',
    firstLogin: true, createdAt: '2024-02-01',
  },
  {
    id: 'user-5', name: '陈小红', phone: '13800000005', password: '888888',
    role: 'student', status: 'active', unit: '北京中医药大学', studentId: '20210001',
    major: '中医学2021级', vipStatus: 'none', firstLogin: false, createdAt: '2024-01-20',
  },
  {
    id: 'user-6', name: '刘伟', phone: '13800000006', password: '888888',
    role: 'student', status: 'active', unit: '北京中医药大学', studentId: '20210002',
    major: '中药学2021级', vipStatus: 'none', firstLogin: false, createdAt: '2024-01-20',
  },
  {
    id: 'user-7', name: '赵静', phone: '13800000007', password: '888888',
    role: 'student', status: 'pending', unit: '上海中医药大学', studentId: '20220015',
    major: '药学2022级', vipStatus: 'none', firstLogin: true, createdAt: '2024-03-15',
  },
  {
    id: 'user-8', name: '孙强老师', phone: '13800000008', password: '888888',
    role: 'teacher', status: 'active', unit: '成都中医药大学', vipStatus: 'none',
    firstLogin: false, createdAt: '2024-02-10',
  },
];

export const EXAM_RECORDS: ExamRecord[] = [
  {
    id: 'exam-1', userId: 'user-5', userName: '陈小红', museumId: 'museum-1',
    museumName: '中药材（饮片）馆', categoryIds: ['cat-1-1', 'cat-1-3'],
    score: 16, totalQuestions: 20, submittedAt: '2024-04-10T14:30:00',
    questions: [
      { id: 'q-1', specimenId: 'sp-1', specimenName: '人参', imageUrl: IMG.ginseng, correctAnswer: '人参', userAnswer: '人参', isCorrect: true },
      { id: 'q-2', specimenId: 'sp-2', specimenName: '白芷', imageUrl: IMG.angelica, correctAnswer: '白芷', userAnswer: '白芷', isCorrect: true },
      { id: 'q-3', specimenId: 'sp-3', specimenName: '黄芪', imageUrl: IMG.astragalus, correctAnswer: '黄芪', userAnswer: '黄耆', isCorrect: false },
      { id: 'q-4', specimenId: 'sp-11', specimenName: '菊花', imageUrl: IMG.chrysanthemum, correctAnswer: '菊花', userAnswer: '菊花', isCorrect: true },
      { id: 'q-5', specimenId: 'sp-12', specimenName: '金银花', imageUrl: IMG.honeysuckle, correctAnswer: '金银花', userAnswer: '忍冬花', isCorrect: false },
    ],
  },
  {
    id: 'exam-2', userId: 'user-6', userName: '刘伟', museumId: 'museum-1',
    museumName: '中药材（饮片）馆', categoryIds: ['cat-1-1', 'cat-1-2', 'cat-1-3', 'cat-1-4'],
    score: 18, totalQuestions: 20, submittedAt: '2024-04-12T10:15:00',
    questions: [
      { id: 'q-6', specimenId: 'sp-8', specimenName: '肉桂', imageUrl: IMG.cinnamon, correctAnswer: '肉桂', userAnswer: '肉桂', isCorrect: true },
      { id: 'q-7', specimenId: 'sp-14', specimenName: '枸杞子', imageUrl: IMG.wolfberry, correctAnswer: '枸杞子', userAnswer: '枸杞', isCorrect: false },
    ],
  },
];

export const VIP_APPLICATIONS: VIPApplication[] = [
  {
    id: 'vip-1', userId: 'user-4', userName: '王丽老师', phone: '13800000004',
    unit: '广州中医药大学', reason: '本人从事中药学教学工作十余年，希望能为标本馆贡献更多标本资源，协助完善馆藏。',
    appliedAt: '2024-04-01', status: 'pending',
  },
  {
    id: 'vip-2', userId: 'user-8', userName: '孙强老师', phone: '13800000008',
    unit: '成都中医药大学', reason: '本人负责中药鉴定课程，有丰富的标本资源，希望申请VIP权限以便上传标本图片。',
    appliedAt: '2024-04-05', status: 'pending',
  },
];

export const REGISTRATION_APPLICATIONS: RegistrationApplication[] = [
  {
    id: 'reg-1', name: '周晓明', phone: '13900001111', role: 'student',
    unit: '北京中医药大学', studentId: '20230023', major: '中医学2023级',
    appliedAt: '2024-04-08', status: 'pending',
  },
  {
    id: 'reg-2', name: '林老师', phone: '13900002222', role: 'teacher',
    unit: '广西中医药大学', contact: '中药学院',
    appliedAt: '2024-04-09', status: 'pending',
  },
  {
    id: 'reg-3', name: '吴雪', phone: '13900003333', role: 'student',
    unit: '上海中医药大学', studentId: '20220108', major: '药学2022级',
    appliedAt: '2024-04-06', status: 'approved',
  },
];

// Generate visit data for past 30 days
const generateVisitData = (): VisitData[] => {
  const data: VisitData[] = [];
  const now = new Date('2024-04-21');
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 200 : 400;
    const variance = Math.floor(Math.random() * 150);
    data.push({
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      visits: base + variance,
      users: Math.floor((base + variance) * 0.6),
    });
  }
  return data;
};

export const VISIT_DATA: VisitData[] = generateVisitData();

export const SYSTEM_STATS = {
  totalVisits: 12456,
  totalUsers: 342,
  totalSpecimens: SPECIMENS.length,
  totalExams: 1892,
  pendingReviews: 5,
  todayVisits: 487,
};

export const SPECIMEN_CATEGORY_STATS = [
  { name: '根及根茎类', count: 7, fill: '#2d6a4f' },
  { name: '皮类', count: 3, fill: '#40916c' },
  { name: '花类', count: 4, fill: '#52b788' },
  { name: '果实及种子类', count: 5, fill: '#74c69d' },
  { name: '叶类', count: 3, fill: '#95d5b2' },
  { name: '全草类', count: 4, fill: '#b7e4c7' },
  { name: '菌藻类', count: 2, fill: '#d8f3dc' },
  { name: '矿物类', count: 2, fill: '#e9f5db' },
];
