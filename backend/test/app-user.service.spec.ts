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
    sysUser: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    appUser: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
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
    it('应该返回待审核注册列表', async () => {
      const mockRows = [{ id: 1, regStatus: '0', user: { userId: 1 } }];
      mockPrismaService.appUser.findMany.mockResolvedValue(mockRows);
      mockPrismaService.appUser.count.mockResolvedValue(1);

      const result = await service.getRegisterAuditList({ skip: 0, take: 10 });
      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
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
});