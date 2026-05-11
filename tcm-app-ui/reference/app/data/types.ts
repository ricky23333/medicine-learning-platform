export interface Museum {
  id: string;
  name: string;
  description: string;
  icon: string;
  categories: Category[];
  createdAt: string;
}

export interface Category {
  id: string;
  museumId: string;
  name: string;
  description?: string;
  specimenCount?: number;
}

export interface Specimen {
  id: string;
  museumId: string;
  categoryId: string;
  name: string;
  latinName?: string;
  images: SpecimenImage[];
  notes: string;
  properties?: string;
  createdAt: string;
  createdBy: string;
}

export interface SpecimenImage {
  id: string;
  specimenId: string;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type UserRole = 'student' | 'teacher' | 'vip_teacher' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended';
export type VIPStatus = 'none' | 'pending' | 'approved';

export interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  unit: string;
  studentId?: string;
  major?: string;
  contact?: string;
  vipStatus: VIPStatus;
  firstLogin: boolean;
  createdAt: string;
  avatar?: string;
}

export interface ExamRecord {
  id: string;
  userId: string;
  userName: string;
  museumId: string;
  museumName: string;
  categoryIds: string[];
  questions: ExamQuestion[];
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

export interface ExamQuestion {
  id: string;
  specimenId: string;
  specimenName: string;
  imageUrl: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface VIPApplication {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  unit: string;
  reason: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RegistrationApplication {
  id: string;
  name: string;
  phone: string;
  role: 'student' | 'teacher';
  unit: string;
  studentId?: string;
  major?: string;
  contact?: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface VisitData {
  date: string;
  visits: number;
  users: number;
}
