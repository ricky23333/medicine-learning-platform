/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 标本管理
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from 'src/common/exceptions/api.exception';
import sharp from 'sharp';
const fs = require('fs');

@Injectable()
export class SpecimenService {
  constructor(private readonly prisma: PrismaService) { }

  /* 新增标本 */
  async add(createSpecimenDto: any) {
    const { specimenName, museumId, categoryId, remark } = createSpecimenDto;
    const exist = await this.prisma.specimen.findFirst({
      where: { specimenName, museumId, categoryId },
    });
    if (exist) throw new ApiException('该分类下标本名称已存在');
    return await this.prisma.specimen.create({
      data: {
        specimenName,
        museumId,
        categoryId,
        remark
      }
    });
  }

  /* 分页查询标本列表 */
  async list(query: any) {
    const { museumId, categoryId, specimenName, status, skip = 0, take = 10 } =
      query;
    const where: any = {};
    if (museumId) where.museumId = Number(museumId);
    if (categoryId) where.categoryId = Number(categoryId);
    if (specimenName) where.specimenName = { contains: specimenName };
    // if (status) where.status = status;
    const [rows, total] = await Promise.all([
      this.prisma.specimen.findMany({
        where,
        skip,
        take: Number(take),
        orderBy: { createTime: 'desc' },
        include: {
          museum: true,
          category: true,
          images: { where: { auditStatus: status } },
        },
      }),
      this.prisma.specimen.count({ where }),
    ]);

    // 从标本的图片中批量查询创建者昵称
    if (rows.length > 0) {
      // 收集所有图片的 createBy
      const imageCreatorIds: string[] = [];
      rows.forEach((specimen) => {
        if (specimen.images) {
          specimen.images.forEach((img) => {
            if (img.createBy && !imageCreatorIds.includes(img.createBy)) {
              imageCreatorIds.push(img.createBy);
            }
          });
        }
      });

      if (imageCreatorIds.length > 0) {
        const users = await this.prisma.sysUser.findMany({
          where: {
            OR: imageCreatorIds.map((id) => ({ userId: Number(id) }),
            ),
          },
          select: { userId: true, userName: true, nickName: true },
        });
        const userMap = new Map<string, string>();
        users.forEach((u) => {
          userMap.set(String(u.userId), u.nickName);
          userMap.set(u.userName, u.nickName);
        });

        // 为每条标本的图片设置 creatorNickName
        rows.forEach((specimen) => {
          if (specimen.images) {
            specimen.images = specimen.images.map((img) => ({
              ...img,
              creatorNickName: img.createBy
                ? userMap.get(img.createBy) || img.createBy
                : img.createBy,
            }));
          }
        });
      }
    }
    return { rows, total };
  }

  /* 小程序分页查询标本（模糊搜索、分类筛选） */
  async listForApp(query: any) {
    const { museumId, categoryId, specimenName, skip = 0, take = 10 } = query;
    const where: any = { status: '0' };
    if (museumId) where.museumId = Number(museumId);
    if (categoryId) where.categoryId = Number(categoryId);
    if (specimenName) where.specimenName = { contains: specimenName };
    const [rows, total] = await Promise.all([
      this.prisma.specimen.findMany({
        where,
        skip,
        take: Number(take),
        orderBy: { createTime: 'desc' },
        include: {
          images: {
            where: { auditStatus: '1' },
            orderBy: [{ isCover: 'desc' }, { sort: 'asc' }],
          },
        },
      }),
      this.prisma.specimen.count({ where }),
    ]);
    return { rows, total };
  }

  /* 通过ID查询标本 */
  async findById(specimenId: number, isApp: boolean = false) {
    const specimen = await this.prisma.specimen.findUnique({
      where: { specimenId },
      include: {
        museum: true,
        category: true,
        images: {
          where: isApp ? { auditStatus: '1' } : undefined,
          orderBy: [{ isCover: 'desc' }, { sort: 'asc' }],
        },
      },
    });

    if (!specimen) return null;

    // 查询创建者昵称
    if (specimen.createBy) {
      const user = await this.prisma.sysUser.findFirst({
        where: {
          OR: [
            { userId: Number(specimen.createBy) },
            { userName: specimen.createBy },
          ],
        },
        select: { nickName: true },
      });
      if (user) {
        (specimen as any).creatorNickName = user.nickName;
      }
    }

    // 查询图片创建者昵称
    if (specimen.images && specimen.images.length > 0) {
      const creatorIds = specimen.images
        .map((img) => img.createBy)
        .filter((cb) => cb);
      if (creatorIds.length > 0) {
        const users = await this.prisma.sysUser.findMany({
          where: {
            OR: creatorIds.map((id) => ({ userId: Number(id) })).concat(
              creatorIds.map((name) => ({ userName: name })),
            ),
          },
          select: { userId: true, userName: true, nickName: true },
        });
        const userMap = new Map<string, string>();
        users.forEach((u) => {
          userMap.set(String(u.userId), u.nickName);
          userMap.set(u.userName, u.nickName);
        });
        specimen.images = specimen.images.map((img) => ({
          ...img,
          creatorNickName: img.createBy ? userMap.get(img.createBy) || img.createBy : img.createBy,
        }));
      }
    }

    return specimen;
  }

  /* 更新标本 */
  async update(updateSpecimenDto: any) {
    const { remark, specimenId } =
      updateSpecimenDto;

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

  /* 上传标本图片（内存存储，原图+缩略图+水印） */
  async addImage(file: Express.Multer.File, createImageDto: any) {
    const COS = require('cos-nodejs-sdk-v5');
    const cos = new COS({
      SecretId: process.env.TENCENT_COS_SECRET_ID,
      SecretKey: process.env.TENCENT_COS_SECRET_KEY,
    });

    const fileExt = file.originalname.split('.').pop() || '.jpg';
    const timestamp = Date.now();
    const originalKey = `specimen/original/${timestamp}.${fileExt}`;
    const thumbnailKey = `specimen/thumbnail/${timestamp}.${fileExt}`;
    const prisma = this.prisma;

    // 是否启用水印
    const enableWatermark = process.env.TENCENT_COS_WATERMARK_ENABLE === 'true';
    const watermarkText = process.env.TENCENT_COS_WATERMARK_TEXT || '';

    // 直接使用内存中的文件 buffer
    let imageBuffer = file.buffer;

    // 如果启用水印，给原图添加水印
    if (enableWatermark && watermarkText) {
      imageBuffer = await this.addWatermark(imageBuffer, watermarkText);
    }

    // 创建缩略图（压缩到宽度400，保持比例）
    let thumbnailBuffer = await sharp(imageBuffer)
      .resize(400, null, { withoutEnlargement: true })
      .toBuffer();

    // 缩略图也添加水印
    if (enableWatermark && watermarkText) {
      thumbnailBuffer = await this.addWatermark(thumbnailBuffer, watermarkText);
    }

    // 上传到COS
    const bucket = process.env.TENCENT_COS_BUCKET;
    const region = process.env.TENCENT_COS_REGION;
    const cdnUrl = `https://${bucket}.cos.${region}.myqcloud.com`;

    return new Promise((resolve, reject) => {
      // 上传原图（使用 putObject）
      cos.putObject(
        {
          Bucket: bucket,
          Region: region,
          Key: originalKey,
          Body: imageBuffer,
          ContentLength: imageBuffer.length,
        },
        (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          const imageUrl = `${cdnUrl}/${originalKey}`;

          // 上传缩略图（使用 putObject）
          cos.putObject(
            {
              Bucket: bucket,
              Region: region,
              Key: thumbnailKey,
              Body: thumbnailBuffer,
              ContentLength: thumbnailBuffer.length,
            },
            (err2, data2) => {
              if (err2) {
                reject(err2);
                return;
              }
              const thumbnailUrl = `${cdnUrl}/${thumbnailKey}`;

              resolve(
                prisma.specimenImage.create({
                  data: {
                    specimenId: Number(createImageDto.specimenId),
                    imageUrl,
                    thumbnailUrl,
                    isCover: Boolean(createImageDto.isCover) || false,
                    createBy: createImageDto.createBy,
                    createTime: new Date(),
                  },
                }),
              );
            },
          );
        },
      );
    });
  }

  /* 添加文字水印和Logo水印 */
  private async addWatermark(buffer: Buffer, text: string): Promise<Buffer> {
    const image = sharp(buffer);
    const imageMetadata = await image.metadata();
    const imageWidth = imageMetadata.width || 800;
    const imageHeight = imageMetadata.height || 600;
    // 读取Logo图片
    const logoPath = require('path').resolve(__dirname, '../../../src/asset/logo.png');

    if (!fs.existsSync(logoPath)) {
      throw new Error(`Logo file NOT FOUND at: ${logoPath}`);
    }
    const logoBuffer = await sharp(logoPath)
      .resize(Math.floor(imageWidth * 0.15), null, { withoutEnlargement: true })
      .toBuffer();
    const logoMetadata = await sharp(logoBuffer).metadata();
    const logoWidth = logoMetadata.width || 100;
    const logoHeight = logoMetadata.height || 100;

    // 计算Logo居中位置
    const centerX = Math.floor((imageWidth - logoWidth) / 2);
    const centerTopY = Math.floor((imageHeight - logoHeight) / 5);
    // 创建文字水印
    const textWidth = text.length * 15;
    const padding = 2;
    const watermarkHeight = 15;
    const svgWatermark = `
      <svg width="${textWidth + padding * 2}" height="${watermarkHeight + padding * 2}">
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.3)"/>
        <text x="${padding}" y="${watermarkHeight / 2 + 8}"
              font-family="WenQuanYi Micro Hei, Noto Sans CJK SC, sans-serif" font-size="16" fill="white" text-anchor="start">
          ${text}
        </text>
      </svg>
    `;
    const textWatermarkBuffer = Buffer.from(svgWatermark);
    // 合成Logo水印（居中）和文字水印（右下角）
    return await image
      .composite([
        { input: logoBuffer, left: centerX, top: centerTopY },
        { input: textWatermarkBuffer, gravity: 'southeast' },
      ])
      .toBuffer();
  }

  /* 删除标本图片 */
  async deleteImage(imageId: number, userId: number, roles?: string[]) {
    const image = await this.prisma.specimenImage.findUnique({
      where: { imageId },
    });
    if (!image) throw new ApiException('图片不存在');

    // 检查权限：用户是admin或者用户上传的图片
    const isAdmin = roles && roles.includes('admin');
    const isOwner = userId && String(userId) === image.createBy;

    if (!isAdmin && !isOwner) {
      throw new ApiException('无权删除该图片');
    }

    await this.prisma.specimenImage.delete({ where: { imageId } });
  }

  /* 审核图片 */
  async auditImage(auditDto: any) {
    const { imageId, auditStatus, auditRemark, auditBy } = auditDto;

    // 如果是拒绝审核，直接删除图片
    if (auditStatus === '2') {
      await this.prisma.specimenImage.delete({ where: { imageId } });
      return { message: '已拒绝并删除图片' };
    }

    // 通过审核，更新审核状态
    return await this.prisma.specimenImage.update({
      where: { imageId },
      data: {
        auditStatus,
        auditRemark,
        auditBy,
        auditTime: new Date(),
      },
    });
  }

  /* 修改图片审核备注 */
  async updateImageRemark(updateRemarkDto: { imageId: number; auditRemark: string }) {
    const { imageId, auditRemark } = updateRemarkDto;
    return await this.prisma.specimenImage.update({
      where: { imageId },
      data: { auditRemark },
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