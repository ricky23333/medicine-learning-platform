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
  constructor(private readonly prisma: PrismaService) {}

  /* 新增馆 */
  async add(createMuseumDto: any) {
    const { museumCode } = createMuseumDto;
    const exist = await this.prisma.museum.findUnique({
      where: { museumCode },
    });
    if (exist) throw new ApiException('馆编码已存在');
    return await this.prisma.museum.create({ data: createMuseumDto });
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
        },
      },
    });
    return museums;
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
    const { museumId, museumCode } = updateMuseumDto;
    const exist = await this.prisma.museum.findFirst({
      where: { museumId: { not: museumId }, museumCode },
    });
    if (exist) throw new ApiException('馆编码已存在');
    return await this.prisma.museum.update({
      where: { museumId },
      data: updateMuseumDto,
    });
  }

  /* 删除馆 */
  async delete(museumIdArr: number[]) {
    await this.prisma.museum.deleteMany({
      where: { museumId: { in: museumIdArr } },
    });
  }
}