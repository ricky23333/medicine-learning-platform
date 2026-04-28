import { Test, TestingModule } from '@nestjs/testing';
import { MuseumService } from '../src/modules/museum/museum.service';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from '../src/common/exceptions/api.exception';

describe('MuseumService', () => {
  let service: MuseumService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    museum: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MuseumService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MuseumService>(MuseumService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('应该成功新增馆', async () => {
      const createDto = { museumName: '中药材馆', museumCode: 'TCM001', sort: 1 };
      mockPrismaService.museum.findUnique.mockResolvedValue(null);
      mockPrismaService.museum.create.mockResolvedValue({ museumId: 1, ...createDto });

      const result = await service.add(createDto);
      expect(result).toHaveProperty('museumId');
      expect(mockPrismaService.museum.findUnique).toHaveBeenCalledWith({
        where: { museumCode: 'TCM001' },
      });
    });

    it('馆编码已存在时应该抛出异常', async () => {
      const createDto = { museumName: '中药材馆', museumCode: 'TCM001' };
      mockPrismaService.museum.findUnique.mockResolvedValue({ museumId: 1, museumCode: 'TCM001' });

      await expect(service.add(createDto)).rejects.toThrow(ApiException);
    });
  });

  describe('list', () => {
    it('应该返回分页列表', async () => {
      const mockRows = [{ museumId: 1, museumName: '馆1' }];
      mockPrismaService.museum.findMany.mockResolvedValue(mockRows);
      mockPrismaService.museum.count.mockResolvedValue(1);

      const result = await service.list({ skip: 0, take: 10 });
      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
    });

    it('应该支持按名称筛选', async () => {
      mockPrismaService.museum.findMany.mockResolvedValue([]);
      mockPrismaService.museum.count.mockResolvedValue(0);

      await service.list({ museumName: '中药' });
      expect(mockPrismaService.museum.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ museumName: { contains: '中药' } }),
        }),
      );
    });
  });

  describe('listWithCategories', () => {
    it('应该返回所有带分类的馆', async () => {
      const mockMuseums = [
        { museumId: 1, museumName: '馆1', categories: [{ categoryId: 1, categoryName: '根茎类' }] },
      ];
      mockPrismaService.museum.findMany.mockResolvedValue(mockMuseums);

      const result = await service.listWithCategories();
      expect(result).toEqual(mockMuseums);
      expect(mockPrismaService.museum.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: '0' },
          include: { categories: expect.any(Object) },
        }),
      );
    });
  });

  describe('findById', () => {
    it('应该通过ID查询馆', async () => {
      const mockMuseum = { museumId: 1, museumName: '馆1', categories: [] };
      mockPrismaService.museum.findUnique.mockResolvedValue(mockMuseum);

      const result = await service.findById(1);
      expect(result).toEqual(mockMuseum);
    });
  });

  describe('update', () => {
    it('应该成功更新馆', async () => {
      const updateDto = { museumId: 1, museumName: '更新后的馆', museumCode: 'TCM001' };
      mockPrismaService.museum.findFirst.mockResolvedValue(null);
      mockPrismaService.museum.update.mockResolvedValue({ museumId: 1, ...updateDto });

      const result = await service.update(updateDto);
      expect(result.museumName).toBe('更新后的馆');
    });

    it('馆编码已存在时应该抛出异常', async () => {
      const updateDto = { museumId: 1, museumCode: 'EXISTING' };
      mockPrismaService.museum.findFirst.mockResolvedValue({ museumId: 2, museumCode: 'EXISTING' });

      await expect(service.update(updateDto)).rejects.toThrow(ApiException);
    });
  });

  describe('delete', () => {
    it('应该成功删除馆', async () => {
      mockPrismaService.museum.deleteMany.mockResolvedValue({ count: 1 });

      await service.delete([1]);
      expect(mockPrismaService.museum.deleteMany).toHaveBeenCalledWith({
        where: { museumId: { in: [1] } },
      });
    });
  });
});