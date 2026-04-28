import { Test, TestingModule } from '@nestjs/testing';
import { SpecimenService } from '../src/modules/specimen/specimen.service';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from '../src/common/exceptions/api.exception';

describe('SpecimenService', () => {
  let service: SpecimenService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    specimen: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    specimenImage: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    specimenVisitLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecimenService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SpecimenService>(SpecimenService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('应该成功新增标本', async () => {
      const createDto = { specimenName: '白芷', museumId: 1, categoryId: 1 };
      mockPrismaService.specimen.findFirst.mockResolvedValue(null);
      mockPrismaService.specimen.create.mockResolvedValue({ specimenId: 1, ...createDto });

      const result = await service.add(createDto);
      expect(result).toHaveProperty('specimenId');
    });

    it('该分类下标本名称已存在时应该抛出异常', async () => {
      const createDto = { specimenName: '白芷', museumId: 1, categoryId: 1 };
      mockPrismaService.specimen.findFirst.mockResolvedValue({ specimenId: 1 });

      await expect(service.add(createDto)).rejects.toThrow(ApiException);
    });
  });

  describe('list', () => {
    it('应该返回分页列表', async () => {
      const mockRows = [{ specimenId: 1, specimenName: '白芷' }];
      mockPrismaService.specimen.findMany.mockResolvedValue(mockRows);
      mockPrismaService.specimen.count.mockResolvedValue(1);

      const result = await service.list({ skip: 0, take: 10 });
      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
    });

    it('应该支持按名称模糊搜索', async () => {
      mockPrismaService.specimen.findMany.mockResolvedValue([]);
      mockPrismaService.specimen.count.mockResolvedValue(0);

      await service.list({ specimenName: '白' });
      expect(mockPrismaService.specimen.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ specimenName: { contains: '白' } }),
        }),
      );
    });
  });

  describe('listForApp', () => {
    it('应该只返回已审核的标本', async () => {
      const mockRows = [{ specimenId: 1, specimenName: '白芷', status: '0' }];
      mockPrismaService.specimen.findMany.mockResolvedValue(mockRows);
      mockPrismaService.specimen.count.mockResolvedValue(1);

      const result = await service.listForApp({ skip: 0, take: 10 });
      expect(result.rows).toEqual(mockRows);
      expect(mockPrismaService.specimen.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: '0' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('应该通过ID查询标本', async () => {
      const mockSpecimen = { specimenId: 1, specimenName: '白芷', images: [], museum: {}, category: {} };
      mockPrismaService.specimen.findUnique.mockResolvedValue(mockSpecimen);

      const result = await service.findById(1);
      expect(result).toEqual(mockSpecimen);
    });
  });

  describe('update', () => {
    it('应该成功更新标本', async () => {
      const updateDto = { specimenId: 1, specimenName: '更新后的标本', museumId: 1, categoryId: 1 };
      mockPrismaService.specimen.findFirst.mockResolvedValue(null);
      mockPrismaService.specimen.update.mockResolvedValue({ specimenId: 1, ...updateDto });

      const result = await service.update(updateDto);
      expect(result.specimenName).toBe('更新后的标本');
    });
  });

  describe('delete', () => {
    it('应该成功删除标本及其图片', async () => {
      mockPrismaService.specimenImage.deleteMany.mockResolvedValue({ count: 2 });
      mockPrismaService.specimen.deleteMany.mockResolvedValue({ count: 1 });

      await service.delete([1]);
      expect(mockPrismaService.specimenImage.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.specimen.deleteMany).toHaveBeenCalled();
    });
  });

  describe('addImage', () => {
    it('应该成功添加图片', async () => {
      const createDto = { specimenId: 1, imageUrl: '/uploads/image.jpg', isCover: true };
      mockPrismaService.specimenImage.create.mockResolvedValue({ imageId: 1, ...createDto });

      const result = await service.addImage(createDto);
      expect(result).toHaveProperty('imageId');
    });
  });

  describe('deleteImage', () => {
    it('应该成功删除图片', async () => {
      mockPrismaService.specimenImage.findUnique.mockResolvedValue({ imageId: 1, createBy: '1' });
      mockPrismaService.specimenImage.delete.mockResolvedValue({ imageId: 1 });

      await service.deleteImage(1, '1');
      expect(mockPrismaService.specimenImage.delete).toHaveBeenCalledWith({ where: { imageId: 1 } });
    });

    it('无权删除他人图片时应该抛出异常', async () => {
      mockPrismaService.specimenImage.findUnique.mockResolvedValue({ imageId: 1, createBy: '2' });

      await expect(service.deleteImage(1, '1')).rejects.toThrow(ApiException);
    });
  });

  describe('auditImage', () => {
    it('应该成功审核图片', async () => {
      const auditDto = { imageId: 1, auditStatus: '0', auditRemark: '审核通过' };
      mockPrismaService.specimenImage.update.mockResolvedValue({ imageId: 1, ...auditDto });

      const result = await service.auditImage(auditDto);
      expect(result.auditStatus).toBe('0');
    });
  });

  describe('recordVisit', () => {
    it('应该成功记录标本访问', async () => {
      mockPrismaService.specimenVisitLog.create.mockResolvedValue({ id: 1 });

      await service.recordVisit(1, 1);
      expect(mockPrismaService.specimenVisitLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          specimenId: 1,
          userId: 1,
        }),
      });
    });

    it('应该能记录匿名访问', async () => {
      mockPrismaService.specimenVisitLog.create.mockResolvedValue({ id: 1 });

      await service.recordVisit(1);
      expect(mockPrismaService.specimenVisitLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          specimenId: 1,
          userId: null,
        }),
      });
    });
  });
});