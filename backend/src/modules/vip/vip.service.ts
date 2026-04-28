/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: VIP教师服务
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from 'src/common/exceptions/api.exception';

@Injectable()
export class VipService {
  constructor(private readonly prisma: PrismaService) {}

  /* VIP创建标本（状态默认为待审核） */
  async createSpecimen(userId: number, createDto: any) {
    // 验证VIP身份
    const appUser = await this.prisma.appUser.findUnique({
      where: { userId },
    });
    if (!appUser || appUser.userType !== 'teacher' || appUser.vipStatus !== '2') {
      throw new ApiException('只有VIP教师才能创建标本', 403);
    }

    const { specimenName, museumId, categoryId, remark } = createDto;

    // 检查标本名是否已存在（同一馆同一分类下）
    const exist = await this.prisma.specimen.findFirst({
      where: { specimenName, museumId, categoryId },
    });
    if (exist) throw new ApiException('该分类下标本名称已存在');

    // 创建标本，状态为待审核(1)
    return await this.prisma.specimen.create({
      data: {
        specimenName,
        museumId,
        categoryId,
        remark,
        status: '1', // 待审核
        createBy: String(userId),
      },
    });
  }

  /* VIP上传标本图片（状态默认为待审核） */
  async uploadImage(userId: number, uploadDto: any) {
    // 验证VIP身份
    const appUser = await this.prisma.appUser.findUnique({
      where: { userId },
    });
    if (!appUser || appUser.userType !== 'teacher' || appUser.vipStatus !== '2') {
      throw new ApiException('只有VIP教师才能上传图片', 403);
    }

    const { specimenId, imageUrl, isCover } = uploadDto;

    // 检查标本是否存在
    const specimen = await this.prisma.specimen.findUnique({
      where: { specimenId },
    });
    if (!specimen) throw new ApiException('标本不存在');

    // 创建图片，审核状态为待审核(1)
    return await this.prisma.specimenImage.create({
      data: {
        specimenId,
        imageUrl,
        isCover: isCover || false,
        createBy: String(userId),
        auditStatus: '1', // 待审核
      },
    });
  }

  /* VIP删除自己上传的图片 */
  async deleteImage(userId: number, imageId: number) {
    // 验证VIP身份
    const appUser = await this.prisma.appUser.findUnique({
      where: { userId },
    });
    if (!appUser || appUser.userType !== 'teacher' || appUser.vipStatus !== '2') {
      throw new ApiException('只有VIP教师才能删除图片', 403);
    }

    const image = await this.prisma.specimenImage.findUnique({
      where: { imageId },
    });
    if (!image) throw new ApiException('图片不存在');

    // 验证是否是VIP自己上传的图片
    if (image.createBy !== String(userId)) {
      throw new ApiException('只能删除自己上传的图片', 403);
    }

    await this.prisma.specimenImage.delete({ where: { imageId } });
    return { message: '删除成功' };
  }

  /* 获取VIP上传的图片列表 */
  async getMyImages(userId: number, query: any) {
    const { skip = 0, take = 10 } = query;
    const [rows, total] = await Promise.all([
      this.prisma.specimenImage.findMany({
        where: { createBy: String(userId) },
        skip,
        take,
        orderBy: { createTime: 'desc' },
        include: {
          specimen: {
            select: {
              specimenId: true,
              specimenName: true,
              museumId: true,
            },
          },
        },
      }),
      this.prisma.specimenImage.count({
        where: { createBy: String(userId) },
      }),
    ]);
    return { rows, total };
  }

  /* 获取VIP创建的标本列表 */
  async getMySpecimens(userId: number, query: any) {
    const { skip = 0, take = 10, status } = query;
    const where: any = {
      createBy: String(userId),
    };
    if (status) where.status = status;

    const [rows, total] = await Promise.all([
      this.prisma.specimen.findMany({
        where,
        skip,
        take,
        orderBy: { createTime: 'desc' },
        include: {
          museum: true,
          category: true,
          images: true,
        },
      }),
      this.prisma.specimen.count({ where }),
    ]);
    return { rows, total };
  }
}