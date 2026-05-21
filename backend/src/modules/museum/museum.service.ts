/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 馆管理
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from 'src/common/exceptions/api.exception';

@Injectable()
export class MuseumService {
  constructor(private readonly prisma: PrismaService) { }

  /* 新增馆 */
  async add(createMuseumDto: { name: string, description?: string }) {
    const { name } = createMuseumDto;
    const exist = await this.prisma.museum.findUnique({
      where: { museumCode: name },
    });
    if (exist) throw new ApiException('该名称目录已存在！');
    return await this.prisma.museum.create({
      data: {
        museumCode: name,
        museumName: name,
        description: createMuseumDto.description,
      }
    });
  }

  /* 分页查询馆列表 */
  async list(query: any) {
    const { museumName, status, skip = 0, take = 10 } = query;
    const where: any = {};
    if (museumName) where.museumName = { contains: museumName };
    if (status) where.status = status;
    const [rows, total] = await Promise.all([
      this.prisma.museum.findMany({
        where,
        skip,
        take,
        orderBy: { sort: 'asc' },
      }),
      this.prisma.museum.count({ where }),
    ]);
    return { rows, total };
  }

  /* 查询所有馆（带分类） */
  async listWithCategories() {
    const museums = await this.prisma.museum.findMany({
      where: { status: '0' },
      orderBy: { sort: 'asc' },
      include: {
        categories: {
          where: { status: '0' },
          orderBy: { sort: 'asc' },
          include: {
            _count: {
              select: { specimens: true },
            },
          },
        },
      },
    });

    // 转换 _count 为 specCount 字段
    return museums.map((museum) => ({
      ...museum,
      categories: museum.categories.map((category) => ({
        ...category,
        specCount: category._count.specimens,
        _count: undefined,
      })),
    }));
  }

  /* 小程序端查询所有馆（带分类，仅返回已启用的馆） */
  async listWithCategoriesForApp() {
    const museums = await this.prisma.museum.findMany({
      where: { status: '0', enabled: true },
      orderBy: { sort: 'asc' },
      include: {
        categories: {
          where: { status: '0' },
          orderBy: { sort: 'asc' },
          include: {
            _count: {
              select: { specimens: true },
            },
          },
        },
      },
    });

    // 转换 _count 为 specCount 字段
    return museums.map((museum) => ({
      ...museum,
      categories: museum.categories.map((category) => ({
        ...category,
        specCount: category._count.specimens,
        _count: undefined,
      })),
    }));
  }

  /* 通过ID查询馆 */
  async findById(museumId: number) {
    return await this.prisma.museum.findUnique({
      where: { museumId },
      include: { categories: true },
    });
  }

  /* 更新馆 */
  async update(updateMuseumDto: any) {
    const { id, name } = updateMuseumDto;
    const exist = await this.prisma.museum.findFirst({
      where: { museumId: { not: id }, museumCode: name },
    });
    if (exist) throw new ApiException('目录重复');
    return await this.prisma.museum.update({
      where: { museumId: id },
      data: {
        museumCode: name,
        museumName: name,
        description: updateMuseumDto.description,
      },
    });
  }

  /* 更新馆启用状态 */
  async updateEnabled(updateMuseumEnabledDto: any) {
    const { museumId, enabled } = updateMuseumEnabledDto;
    await this.prisma.museum.update({
      where: { museumId },
      data: { enabled: Boolean(enabled) },
    });
  }

  /* 删除馆 */
  async delete(museumIdArr: number[]) {
    await this.prisma.$transaction(async (prisma) => {
      // 1. 获取所有要删除的馆的标本
      const specimens = await prisma.specimen.findMany({
        where: { museumId: { in: museumIdArr } },
        select: { specimenId: true },
      });
      const specimenIds = specimens.map((s) => s.specimenId);

      // 2. 删除考试题目（关联标本）
      if (specimenIds.length > 0) {
        await prisma.examQuestion.deleteMany({
          where: { specimenId: { in: specimenIds } },
        });
      }

      // 3. 删除考试（关联馆）
      await prisma.exam.deleteMany({
        where: { museumId: { in: museumIdArr } },
      });

      // 4. 删除标本（关联馆）
      await prisma.specimen.deleteMany({
        where: { museumId: { in: museumIdArr } },
      });

      // 5. 删除分类（关联馆）
      await prisma.category.deleteMany({
        where: { museumId: { in: museumIdArr } },
      });

      // 6. 删除馆
      await prisma.museum.deleteMany({
        where: { museumId: { in: museumIdArr } },
      });
    });
  }
}