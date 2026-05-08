/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 标本管理
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from 'src/common/exceptions/api.exception';

@Injectable()
export class SpecimenService {
  constructor(private readonly prisma: PrismaService) { }

  /* 新增标本 */
  async add(createSpecimenDto: any) {
    const { specimenName, museumId, categoryId } = createSpecimenDto;
    const exist = await this.prisma.specimen.findFirst({
      where: { specimenName, museumId, categoryId },
    });
    if (exist) throw new ApiException('该分类下标本名称已存在');
    return await this.prisma.specimen.create({ data: createSpecimenDto });
  }

  /* 分页查询标本列表 */
  async list(query: any) {
    const { museumId, categoryId, specimenName, status, skip = 0, take = 10 } =
      query;
    const where: any = {};
    if (museumId) where.museumId = museumId;
    if (categoryId) where.categoryId = categoryId;
    if (specimenName) where.specimenName = { contains: specimenName };
    if (status) where.status = status;
    const [rows, total] = await Promise.all([
      this.prisma.specimen.findMany({
        where,
        skip,
        take: Number(take),
        orderBy: { createTime: 'desc' },
        include: {
          museum: true,
          category: true,
          images: { where: { auditStatus: '0' } },
        },
      }),
      this.prisma.specimen.count({ where }),
    ]);
    return { rows, total };
  }

  /* 小程序分页查询标本（模糊搜索、分类筛选） */
  async listForApp(query: any) {
    const { museumId, categoryId, specimenName, skip = 0, take = 10 } = query;
    const where: any = { status: '0' };
    if (museumId) where.museumId = museumId;
    if (categoryId) where.categoryId = categoryId;
    if (specimenName) where.specimenName = { contains: specimenName };
    const [rows, total] = await Promise.all([
      this.prisma.specimen.findMany({
        where,
        skip,
        take: Number(take),
        orderBy: { createTime: 'desc' },
        include: {
          images: {
            where: { auditStatus: '0' },
            orderBy: [{ isCover: 'desc' }, { sort: 'asc' }],
          },
        },
      }),
      this.prisma.specimen.count({ where }),
    ]);
    return { rows, total };
  }

  /* 通过ID查询标本 */
  async findById(specimenId: number) {
    return await this.prisma.specimen.findUnique({
      where: { specimenId },
      include: {
        museum: true,
        category: true,
        images: { orderBy: [{ isCover: 'desc' }, { sort: 'asc' }] },
      },
    });
  }

  /* 更新标本 */
  async update(updateSpecimenDto: any) {
    const { specimenId, specimenName, museumId, categoryId } =
      updateSpecimenDto;
    const exist = await this.prisma.specimen.findFirst({
      where: {
        specimenId: { not: specimenId },
        specimenName,
        museumId,
        categoryId,
      },
    });
    if (exist) throw new ApiException('该分类下标本名称已存在');
    return await this.prisma.specimen.update({
      where: { specimenId },
      data: updateSpecimenDto,
    });
  }

  /* 删除标本 */
  async delete(specimenIdArr: number[]) {
    await this.prisma.specimenImage.deleteMany({
      where: { specimenId: { in: specimenIdArr } },
    });
    await this.prisma.specimen.deleteMany({
      where: { specimenId: { in: specimenIdArr } },
    });
  }

  /* 上传标本图片 */
  async addImage(createImageDto: any) {
    return await this.prisma.specimenImage.create({ data: createImageDto });
  }

  /* 删除标本图片 */
  async deleteImage(imageId: number, userId: string) {
    const image = await this.prisma.specimenImage.findUnique({
      where: { imageId },
    });
    if (!image) throw new ApiException('图片不存在');
    // VIP教师只能删除自己上传的图片
    if (userId !== image.createBy) {
      throw new ApiException('无权删除该图片');
    }
    await this.prisma.specimenImage.delete({ where: { imageId } });
  }

  /* 审核图片 */
  async auditImage(auditDto: any) {
    const { imageId, auditStatus, auditRemark } = auditDto;
    return await this.prisma.specimenImage.update({
      where: { imageId },
      data: { auditStatus, auditRemark, auditTime: new Date() },
    });
  }

  /* 记录标本访问 */
  async recordVisit(specimenId: number, userId?: number) {
    await this.prisma.specimenVisitLog.create({
      data: {
        specimenId,
        userId: userId || null,
        visitTime: new Date(),
      },
    });
  }
}