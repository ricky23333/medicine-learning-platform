import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../src/modules/category/category.service';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from '../src/common/exceptions/api.exception';

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    category: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
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
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('应该成功新增分类', async () => {
      const createDto = { categoryName: '根茎类', categoryCode: 'ROOT001', museumId: 1, sort: 1 };
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue({ categoryId: 1, ...createDto });

      const result = await service.add(createDto);
      expect(result).toHaveProperty('categoryId');
    });

    it('该馆下分类编码已存在时应该抛出异常', async () => {
      const createDto = { categoryName: '根茎类', categoryCode: 'ROOT001', museumId: 1 };
      mockPrismaService.category.findFirst.mockResolvedValue({ categoryId: 1 });

      await expect(service.add(createDto)).rejects.toThrow(ApiException);
    });
  });

  describe('list', () => {
    it('应该返回分页列表', async () => {
      const mockRows = [{ categoryId: 1, categoryName: '根茎类' }];
      mockPrismaService.category.findMany.mockResolvedValue(mockRows);
      mockPrismaService.category.count.mockResolvedValue(1);

      const result = await service.list({ skip: 0, take: 10 });
      expect(result.rows).toEqual(mockRows);
      expect(result.total).toBe(1);
    });

    it('应该支持按馆ID筛选', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);
      mockPrismaService.category.count.mockResolvedValue(0);

      await service.list({ museumId: 1 });
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ museumId: 1 }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('应该通过ID查询分类', async () => {
      const mockCategory = { categoryId: 1, categoryName: '根茎类', museum: { museumId: 1 } };
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findById(1);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('应该成功更新分类', async () => {
      const updateDto = { categoryId: 1, categoryName: '更新后的分类', categoryCode: 'ROOT001', museumId: 1 };
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.update.mockResolvedValue({ categoryId: 1, ...updateDto });

      const result = await service.update(updateDto);
      expect(result.categoryName).toBe('更新后的分类');
    });
  });

  describe('delete', () => {
    it('应该成功删除分类', async () => {
      mockPrismaService.category.deleteMany.mockResolvedValue({ count: 1 });

      await service.delete([1]);
      expect(mockPrismaService.category.deleteMany).toHaveBeenCalledWith({
        where: { categoryId: { in: [1] } },
      });
    });
  });
});