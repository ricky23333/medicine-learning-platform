import { Test, TestingModule } from '@nestjs/testing';
import { AppUserService } from '../src/modules/app-user/app-user.service';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from '../src/common/exceptions/api.exception';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AppUserService', () => {
  let service: AppUserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn(async (callback) => callback(mockPrismaService)),
    sysUser: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    appUser: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppUserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppUserService>(AppUserService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Mock bcrypt
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const registerDto = {
        phone: '13800138000',
        userType: 'student',
        realName: '张三',
        institution: '某大学',
        majorGrade: '大一',
        studentNo: '2024001',
      };
      mockPrismaService.sysUser.findFirst.mockResolvedValue(null);
      mockPrismaService.sysUser.create.mockResolvedValue({ userId: 1, userName: '13800138000' });
      mockPrismaService.appUser.create.mockResolvedValue({ id: 1, ...registerDto });

      const result = await service.register(registerDto);
      expect(result).toHaveProperty('message');
      expect(mockPrismaService.sysUser.create).toHaveBeenCalled();
      expect(mockPrismaService.appUser.create).toHaveBeenCalled();
    });

    it('手机号已注册时应该抛出异常', async () => {
      const registerDto = { phone: '13800138000' };
      mockPrismaService.sysUser.findFirst.mockResolvedValue({ userId: 1 });

      await expect(service.register(registerDto)).rejects.toThrow(ApiException);
    });
  });

  describe('applyVip', () => {
    it('教师应该能成功申请VIP', async () => {
      mockPrismaService.appUser.findUnique.mockResolvedValue({
        userId: 1,
        userType: 'teacher',
        vipStatus: '0',
      });
      mockPrismaService.appUser.update.mockResolvedValue({ vipStatus: '1' });

      const result = await service.applyVip(1);
      expect(result).toHaveProperty('message');
    });

    it('学生不能申请VIP', async () => {
      mockPrismaService.appUser.findUnique.mockResolvedValue({
        userId: 1,
        userType: 'student',
        vipStatus: '0',
      });

      await expect(service.applyVip(1)).rejects.toThrow(ApiException);
    });

    it('已经是VIP时应该抛出异常', async () => {
      mockPrismaService.appUser.findUnique.mockResolvedValue({
        userId: 1,
        userType: 'teacher',
        vipStatus: '2',
      });

      await expect(service.applyVip(1)).rejects.toThrow(ApiException);
    });

    it('申请中时应该抛出异常', async () => {
      mockPrismaService.appUser.findUnique.mockResolvedValue({
        userId: 1,
        userType: 'teacher',
        vipStatus: '1',
      });

      await expect(service.applyVip(1)).rejects.toThrow(ApiException);
    });
  });

  describe('getInfo', () => {
    it('应该返回用户信息', async () => {
      const mockAppUser = {
        userId: 1,
        userType: 'student',
        realName: '张三',
        phone: '13800138000',
        user: {
          userId: 1,
          userName: '13800138000',
          nickName: '张三',
        },
      };
      mockPrismaService.appUser.findUnique.mockResolvedValue(mockAppUser);

      const result = await service.getInfo(1);
      expect(result).toEqual(mockAppUser);
    });

    it('用户不存在时应该抛出异常', async () => {
      mockPrismaService.appUser.findUnique.mockResolvedValue(null);

      await expect(service.getInfo(1)).rejects.toThrow(ApiException);
    });
  });

  describe('updateProfile', () => {
    it('应该成功更新用户信息', async () => {
      mockPrismaService.appUser.update.mockResolvedValue({});

      await service.updateProfile(1, { realName: '李四', institution: '新大学' });
      expect(mockPrismaService.appUser.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: expect.objectContaining({ realName: '李四', institution: '新大学' }),
      });
    });
  });

  describe('getRegisterAuditList', () => {
    it('应该返回待审核注册列表（包含deptName）', async () => {
      const mockRows = [
        {
          id: 1,
          regStatus: '0',
          user: {
            userId: 1,
            userName: '13800138000',
            status: '0',
            dept: { deptId: 1, deptName: '计算机学院' },
          },
        },
      ];
      mockPrismaService.appUser.findMany.mockResolvedValue(mockRows);
      mockPrismaService.appUser.count.mockResolvedValue(1);

      const result = await service.getRegisterAuditList({ skip: 0, take: 10 });
      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
      // 验证 deptName 字段存在
      expect(result.rows[0].user.dept.deptName).toBe('计算机学院');
    });
  });

  describe('approveRegister', () => {
    it('应该成功通过注册', async () => {
      mockPrismaService.appUser.update.mockResolvedValue({});
      mockPrismaService.sysUser.update.mockResolvedValue({});

      await service.approveRegister(1, 'admin');
      expect(mockPrismaService.appUser.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: expect.objectContaining({ regStatus: '1' }),
      });
    });
  });

  describe('rejectRegister', () => {
    it('应该成功拒绝注册并删除用户', async () => {
      mockPrismaService.appUser.delete.mockResolvedValue({ userId: 1 });
      mockPrismaService.sysUser.delete.mockResolvedValue({ userId: 1 });

      await service.rejectRegister(1, 'admin');
      expect(mockPrismaService.appUser.delete).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(mockPrismaService.sysUser.delete).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });

  describe('getVipAuditList', () => {
    it('应该返回VIP申请列表', async () => {
      const mockRows = [{ id: 1, vipStatus: '1', userType: 'teacher' }];
      mockPrismaService.appUser.findMany.mockResolvedValue(mockRows);
      mockPrismaService.appUser.count.mockResolvedValue(1);

      const result = await service.getVipAuditList({ skip: 0, take: 10 });
      expect(result.rows).toEqual(mockRows);
    });
  });

  describe('approveVip', () => {
    it('应该成功通过VIP申请', async () => {
      mockPrismaService.appUser.update.mockResolvedValue({});

      await service.approveVip(1, 'admin');
      expect(mockPrismaService.appUser.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: expect.objectContaining({ vipStatus: '2' }),
      });
    });
  });

  describe('rejectVip', () => {
    it('应该成功拒绝VIP申请', async () => {
      mockPrismaService.appUser.update.mockResolvedValue({});

      await service.rejectVip(1, 'admin');
      expect(mockPrismaService.appUser.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: expect.objectContaining({ vipStatus: '3' }),
      });
    });
  });

  describe('batchImport', () => {
    it('应该成功批量导入新用户', async () => {
      const importUsers = [
        {
          userName: '13800138001',
          password: '123456',
          realName: '张三',
          institution: '北京大学',
          userType: 'student',
          majorGrade: '大一',
          studentNo: '2024001',
        },
      ];
      mockPrismaService.sysUser.findFirst.mockResolvedValue(null);
      mockPrismaService.sysUser.create.mockResolvedValue({ userId: 1, userName: '13800138001' });
      mockPrismaService.appUser.create.mockResolvedValue({ id: 1 });

      const result = await service.batchImport(importUsers, false);
      expect(result.success).toBe(1);
      expect(result.fail).toBe(0);
    });

    it('用户已存在时应该跳过（isUpdateSupport=false）', async () => {
      const importUsers = [
        { userName: '13800138001', realName: '张三', institution: '北京大学', userType: 'student' },
      ];
      mockPrismaService.sysUser.findFirst.mockResolvedValue({ userId: 1, userName: '13800138001' });

      const result = await service.batchImport(importUsers, false);
      expect(result.success).toBe(0);
      expect(result.fail).toBe(1);
      expect(result.errors[0]).toContain('已存在');
    });

    it('用户已存在时应该更新（isUpdateSupport=true）', async () => {
      const importUsers = [
        { userName: '13800138001', realName: '李四', institution: '清华大学', userType: 'student' },
      ];
      mockPrismaService.sysUser.findFirst.mockResolvedValue({ userId: 1, userName: '13800138001' });
      mockPrismaService.sysUser.update.mockResolvedValue({});
      mockPrismaService.appUser.update.mockResolvedValue({});

      const result = await service.batchImport(importUsers, true);
      expect(result.success).toBe(1);
      expect(mockPrismaService.sysUser.update).toHaveBeenCalled();
      expect(mockPrismaService.appUser.update).toHaveBeenCalled();
    });
  });

  describe('getUniversityStats', () => {
    it('应该返回所有高校统计', async () => {
      const mockStats = [
        { institution: '北京大学', _count: { userId: 100 } },
        { institution: '清华大学', _count: { userId: 80 } },
      ];
      mockPrismaService.appUser.groupBy.mockResolvedValue(mockStats);

      const result = await service.getUniversityStats();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ institution: '北京大学', userCount: 100 });
      expect(result[1]).toEqual({ institution: '清华大学', userCount: 80 });
    });

    it('应该正确统计每所高校人数', async () => {
      const mockStats = [
        { institution: '北京大学', _count: { userId: 50 } },
        { institution: '北京大学', _count: { userId: 50 } }, // 模拟两次查询
      ];
      mockPrismaService.appUser.groupBy.mockResolvedValue(mockStats);

      const result = await service.getUniversityStats();
      expect(result[0].userCount).toBe(50);
    });
  });

  describe('getUniversityDetailStats', () => {
    it('应该返回总人数、专业数、年级分布', async () => {
      const mockUsers = [
        { userType: 'student', majorGrade: '大一' },
        { userType: 'student', majorGrade: '大一' },
        { userType: 'student', majorGrade: '大二' },
        { userType: 'teacher', majorGrade: null },
      ];
      mockPrismaService.appUser.findMany.mockResolvedValue(mockUsers);

      const result = await service.getUniversityDetailStats('北京大学');
      expect(result.totalUsers).toBe(4);
      expect(result.majorCount).toBe(2);
      expect(result.studentCount).toBe(3);
      expect(result.gradeDistribution).toHaveLength(2);
    });

    it('应该正确按年级分组', async () => {
      const mockUsers = [
        { userType: 'student', majorGrade: '大一' },
        { userType: 'student', majorGrade: '大一' },
        { userType: 'student', majorGrade: '大二' },
      ];
      mockPrismaService.appUser.findMany.mockResolvedValue(mockUsers);

      const result = await service.getUniversityDetailStats('北京大学');
      const gradeMap = new Map(result.gradeDistribution.map((g) => [g.majorGrade, g.studentCount]));
      expect(gradeMap.get('大一')).toBe(2);
      expect(gradeMap.get('大二')).toBe(1);
    });
  });
});