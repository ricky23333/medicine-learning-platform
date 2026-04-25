import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type {
  User, Museum, Specimen, ExamRecord, VIPApplication, RegistrationApplication,
  Category, SpecimenImage,
} from '../data/types';
import {
  MUSEUMS, SPECIMENS, USERS, EXAM_RECORDS, VIP_APPLICATIONS, REGISTRATION_APPLICATIONS,
} from '../data/mockData';

interface AppState {
  currentUser: User | null;
  museums: Museum[];
  specimens: Specimen[];
  users: User[];
  examRecords: ExamRecord[];
  vipApplications: VIPApplication[];
  registrationApplications: RegistrationApplication[];
}

interface AppContextValue extends AppState {
  login: (phone: string, password: string) => { success: boolean; message: string; user?: User };
  logout: () => void;
  changePassword: (userId: string, newPassword: string) => void;
  // Museum management
  addMuseum: (museum: Omit<Museum, 'id' | 'createdAt' | 'categories'>) => void;
  updateMuseum: (id: string, data: Partial<Museum>) => void;
  deleteMuseum: (id: string) => void;
  addCategory: (museumId: string, category: Omit<Category, 'id' | 'museumId'>) => void;
  updateCategory: (museumId: string, categoryId: string, data: Partial<Category>) => void;
  deleteCategory: (museumId: string, categoryId: string) => void;
  // Specimen management
  addSpecimen: (specimen: Omit<Specimen, 'id' | 'createdAt'>) => void;
  updateSpecimen: (id: string, data: Partial<Specimen>) => void;
  deleteSpecimen: (id: string) => void;
  addSpecimenImage: (specimenId: string, image: Omit<SpecimenImage, 'id'>) => void;
  approveImage: (specimenId: string, imageId: string) => void;
  rejectImage: (specimenId: string, imageId: string) => void;
  deleteImage: (specimenId: string, imageId: string) => void;
  // User management
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  batchImportUsers: (usersData: Omit<User, 'id' | 'createdAt'>[]) => void;
  // Reviews
  approveVIP: (applicationId: string) => void;
  rejectVIP: (applicationId: string) => void;
  approveRegistration: (applicationId: string) => void;
  rejectRegistration: (applicationId: string) => void;
  applyForVIP: (userId: string, reason: string) => void;
  // Exams
  submitExam: (record: Omit<ExamRecord, 'id'>) => void;
  // Self registration
  submitRegistration: (data: Omit<RegistrationApplication, 'id' | 'appliedAt' | 'status'>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    museums: MUSEUMS,
    specimens: SPECIMENS,
    users: USERS,
    examRecords: EXAM_RECORDS,
    vipApplications: VIP_APPLICATIONS,
    registrationApplications: REGISTRATION_APPLICATIONS,
  });

  const login = useCallback((phone: string, password: string) => {
    const user = state.users.find(u => u.phone === phone);
    if (!user) return { success: false, message: '账号不存在，请检查手机号' };
    if (user.status === 'pending') return { success: false, message: '账号待审核，请联系管理员' };
    if (user.status === 'suspended') return { success: false, message: '账号已被停用' };
    if (user.password !== password) return { success: false, message: '密码错误' };
    setState(s => ({ ...s, currentUser: user }));
    return { success: true, message: '登录成功', user };
  }, [state.users]);

  const logout = useCallback(() => {
    setState(s => ({ ...s, currentUser: null }));
  }, []);

  const changePassword = useCallback((userId: string, newPassword: string) => {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === userId ? { ...u, password: newPassword, firstLogin: false } : u),
      currentUser: s.currentUser?.id === userId ? { ...s.currentUser, password: newPassword, firstLogin: false } : s.currentUser,
    }));
  }, []);

  const addMuseum = useCallback((museum: Omit<Museum, 'id' | 'createdAt' | 'categories'>) => {
    const newMuseum: Museum = {
      ...museum, id: `museum-${Date.now()}`, categories: [], createdAt: new Date().toISOString().split('T')[0],
    };
    setState(s => ({ ...s, museums: [...s.museums, newMuseum] }));
  }, []);

  const updateMuseum = useCallback((id: string, data: Partial<Museum>) => {
    setState(s => ({ ...s, museums: s.museums.map(m => m.id === id ? { ...m, ...data } : m) }));
  }, []);

  const deleteMuseum = useCallback((id: string) => {
    setState(s => ({
      ...s,
      museums: s.museums.filter(m => m.id !== id),
      specimens: s.specimens.filter(sp => sp.museumId !== id),
    }));
  }, []);

  const addCategory = useCallback((museumId: string, category: Omit<Category, 'id' | 'museumId'>) => {
    const newCategory: Category = { ...category, id: `cat-${Date.now()}`, museumId, specimenCount: 0 };
    setState(s => ({
      ...s,
      museums: s.museums.map(m => m.id === museumId ? { ...m, categories: [...m.categories, newCategory] } : m),
    }));
  }, []);

  const updateCategory = useCallback((museumId: string, categoryId: string, data: Partial<Category>) => {
    setState(s => ({
      ...s,
      museums: s.museums.map(m => m.id === museumId
        ? { ...m, categories: m.categories.map(c => c.id === categoryId ? { ...c, ...data } : c) }
        : m),
    }));
  }, []);

  const deleteCategory = useCallback((museumId: string, categoryId: string) => {
    setState(s => ({
      ...s,
      museums: s.museums.map(m => m.id === museumId
        ? { ...m, categories: m.categories.filter(c => c.id !== categoryId) }
        : m),
      specimens: s.specimens.filter(sp => sp.categoryId !== categoryId),
    }));
  }, []);

  const addSpecimen = useCallback((specimen: Omit<Specimen, 'id' | 'createdAt'>) => {
    const newSpecimen: Specimen = { ...specimen, id: `sp-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    setState(s => ({ ...s, specimens: [...s.specimens, newSpecimen] }));
  }, []);

  const updateSpecimen = useCallback((id: string, data: Partial<Specimen>) => {
    setState(s => ({ ...s, specimens: s.specimens.map(sp => sp.id === id ? { ...sp, ...data } : sp) }));
  }, []);

  const deleteSpecimen = useCallback((id: string) => {
    setState(s => ({ ...s, specimens: s.specimens.filter(sp => sp.id !== id) }));
  }, []);

  const addSpecimenImage = useCallback((specimenId: string, image: Omit<SpecimenImage, 'id'>) => {
    const newImage: SpecimenImage = { ...image, id: `img-${Date.now()}` };
    setState(s => ({
      ...s,
      specimens: s.specimens.map(sp => sp.id === specimenId ? { ...sp, images: [...sp.images, newImage] } : sp),
    }));
  }, []);

  const approveImage = useCallback((specimenId: string, imageId: string) => {
    setState(s => ({
      ...s,
      specimens: s.specimens.map(sp => sp.id === specimenId
        ? { ...sp, images: sp.images.map(img => img.id === imageId ? { ...img, status: 'approved' as const } : img) }
        : sp),
    }));
  }, []);

  const rejectImage = useCallback((specimenId: string, imageId: string) => {
    setState(s => ({
      ...s,
      specimens: s.specimens.map(sp => sp.id === specimenId
        ? { ...sp, images: sp.images.map(img => img.id === imageId ? { ...img, status: 'rejected' as const } : img) }
        : sp),
    }));
  }, []);

  const deleteImage = useCallback((specimenId: string, imageId: string) => {
    setState(s => ({
      ...s,
      specimens: s.specimens.map(sp => sp.id === specimenId
        ? { ...sp, images: sp.images.filter(img => img.id !== imageId) }
        : sp),
    }));
  }, []);

  const addUser = useCallback((user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = { ...user, id: `user-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    setState(s => ({ ...s, users: [...s.users, newUser] }));
  }, []);

  const updateUser = useCallback((id: string, data: Partial<User>) => {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === id ? { ...u, ...data } : u),
      currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...data } : s.currentUser,
    }));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setState(s => ({ ...s, users: s.users.filter(u => u.id !== id) }));
  }, []);

  const batchImportUsers = useCallback((usersData: Omit<User, 'id' | 'createdAt'>[]) => {
    const newUsers: User[] = usersData.map((u, i) => ({
      ...u, id: `user-import-${Date.now()}-${i}`, createdAt: new Date().toISOString().split('T')[0],
    }));
    setState(s => ({ ...s, users: [...s.users, ...newUsers] }));
  }, []);

  const approveVIP = useCallback((applicationId: string) => {
    setState(s => {
      const app = s.vipApplications.find(a => a.id === applicationId);
      if (!app) return s;
      return {
        ...s,
        vipApplications: s.vipApplications.map(a => a.id === applicationId ? { ...a, status: 'approved' as const } : a),
        users: s.users.map(u => u.id === app.userId ? { ...u, role: 'vip_teacher' as const, vipStatus: 'approved' as const } : u),
      };
    });
  }, []);

  const rejectVIP = useCallback((applicationId: string) => {
    setState(s => {
      const app = s.vipApplications.find(a => a.id === applicationId);
      if (!app) return s;
      return {
        ...s,
        vipApplications: s.vipApplications.map(a => a.id === applicationId ? { ...a, status: 'rejected' as const } : a),
        users: s.users.map(u => u.id === app.userId ? { ...u, vipStatus: 'none' as const } : u),
      };
    });
  }, []);

  const approveRegistration = useCallback((applicationId: string) => {
    setState(s => {
      const app = s.registrationApplications.find(a => a.id === applicationId);
      if (!app) return s;
      const existingUser = s.users.find(u => u.phone === app.phone);
      if (existingUser) {
        return {
          ...s,
          registrationApplications: s.registrationApplications.map(a => a.id === applicationId ? { ...a, status: 'approved' as const } : a),
          users: s.users.map(u => u.phone === app.phone ? { ...u, status: 'active' as const } : u),
        };
      }
      const newUser: User = {
        id: `user-${Date.now()}`, name: app.name, phone: app.phone, password: '888888',
        role: app.role, status: 'active', unit: app.unit, studentId: app.studentId,
        major: app.major, contact: app.contact, vipStatus: 'none', firstLogin: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      return {
        ...s,
        registrationApplications: s.registrationApplications.map(a => a.id === applicationId ? { ...a, status: 'approved' as const } : a),
        users: [...s.users, newUser],
      };
    });
  }, []);

  const rejectRegistration = useCallback((applicationId: string) => {
    setState(s => ({
      ...s,
      registrationApplications: s.registrationApplications.map(a => a.id === applicationId ? { ...a, status: 'rejected' as const } : a),
    }));
  }, []);

  const applyForVIP = useCallback((userId: string, reason: string) => {
    const user = state.users.find(u => u.id === userId);
    if (!user) return;
    const newApp: VIPApplication = {
      id: `vip-${Date.now()}`, userId, userName: user.name, phone: user.phone,
      unit: user.unit, reason, appliedAt: new Date().toISOString(), status: 'pending',
    };
    setState(s => ({
      ...s,
      vipApplications: [...s.vipApplications, newApp],
      users: s.users.map(u => u.id === userId ? { ...u, vipStatus: 'pending' as const } : u),
      currentUser: s.currentUser?.id === userId ? { ...s.currentUser, vipStatus: 'pending' as const } : s.currentUser,
    }));
  }, [state.users]);

  const submitExam = useCallback((record: Omit<ExamRecord, 'id'>) => {
    const newRecord: ExamRecord = { ...record, id: `exam-${Date.now()}` };
    setState(s => ({ ...s, examRecords: [...s.examRecords, newRecord] }));
  }, []);

  const submitRegistration = useCallback((data: Omit<RegistrationApplication, 'id' | 'appliedAt' | 'status'>) => {
    const newApp: RegistrationApplication = {
      ...data, id: `reg-${Date.now()}`, appliedAt: new Date().toISOString(), status: 'pending',
    };
    setState(s => ({ ...s, registrationApplications: [...s.registrationApplications, newApp] }));
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      login, logout, changePassword,
      addMuseum, updateMuseum, deleteMuseum, addCategory, updateCategory, deleteCategory,
      addSpecimen, updateSpecimen, deleteSpecimen, addSpecimenImage, approveImage, rejectImage, deleteImage,
      addUser, updateUser, deleteUser, batchImportUsers,
      approveVIP, rejectVIP, approveRegistration, rejectRegistration, applyForVIP,
      submitExam, submitRegistration,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}