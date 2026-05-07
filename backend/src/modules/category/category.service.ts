/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 分类管理
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from 'src/common/exceptions/api.exception';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) { }

  /* 新增分类 */
  async add(createCategoryDto: any) {
    const { name, museumId, description } = createCategoryDto;
    const exist = await this.prisma.category.findFirst({
      where: { museumId, categoryCode: name },
    });
    if (exist) throw new ApiException('该目录下分类编码已存在');
    return await this.prisma.category.create({
      data: {
        museumId,
        categoryName: name,
        categoryCode: name,
        description,
      }
    });
  }

  /* 分页查询分类列表 */
  async list(query: any) {
    const { museumId, categoryName, status, skip = 0, take = 10 } = query;
    const where: any = {};
    if (museumId) where.museumId = museumId;
    if (categoryName) where.categoryName = { contains: categoryName };
    if (status) where.status = status;
    const [rows, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { sort: 'asc' },
        include: { museum: true },
      }),
      this.prisma.category.count({ where }),
    ]);
    return { rows, total };
  }

  /* 通过ID查询分类 */
  async findById(categoryId: number) {
    return await this.prisma.category.findUnique({
      where: { categoryId },
      include: { museum: true },
    });
  }

  /* 更新分类 */
  async update(updateCategoryDto: any) {
    const { description, id, name } = updateCategoryDto;
    const exist = await this.prisma.category.findFirst({
      where: { categoryId: { not: id }, categoryCode: name },
    });
    if (exist) throw new ApiException('该目录下分类编码已存在');
    return await this.prisma.category.update({
      where: { categoryId: id },
      data: {
        categoryName: name,
        categoryCode: name,
        description,
      },
    });
  }

  /* 删除分类 */
  async delete(categoryIdArr: number[]) {
    await this.prisma.category.deleteMany({
      where: { categoryId: { in: categoryIdArr } },
    });
  }
}