/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 反馈建议服务
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { AddAppFeedbackDto, GetAppFeedbackListDto, UpdateAppFeedbackDto } from './dto/req-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) { }

  /* 小程序端提交反馈 */
  async add(addAppFeedbackDto: AddAppFeedbackDto, userId?: number) {
    return await this.prisma.appFeedback.create({
      data: {
        content: addAppFeedbackDto.content,
        contact: addAppFeedbackDto.contact,
        images: addAppFeedbackDto.images,
        userId: userId,
        createTime: new Date(),
      }
    });
  }

  /* 管理员分页查询反馈列表 */
  async list(getAppFeedbackListDto: GetAppFeedbackListDto) {
    const { status, content, userId, nickname, skip = 0, take = 10 } = getAppFeedbackListDto;
    const where: any = {};
    if (status) where.status = status;
    if (content) where.content = { contains: content };
    if (userId) where.userId = userId;

    // 如果提供了nickname，先查询对应的userId列表
    if (nickname) {
      const sysUsers = await this.prisma.sysUser.findMany({
        where: { nickName: { contains: nickname } },
        select: { userId: true },
      });
      const nicknameUserIds = sysUsers.map((u) => u.userId);
      if (nicknameUserIds.length > 0) {
        where.userId = { in: nicknameUserIds };
      } else {
        // 没有匹配的用户，直接返回空结果
        return { rows: [], total: 0 };
      }
    }

    const [rows, total] = await Promise.all([
      this.prisma.appFeedback.findMany({
        where,
        skip,
        take: Number(take),
        orderBy: { createTime: 'desc' },
      }),
      this.prisma.appFeedback.count({ where }),
    ]);

    // 收集所有userId并批量查询用户信息
    const userIds = rows.map((r) => r.userId).filter((id) => id != null) as number[];
    const sysUsers = userIds.length > 0
      ? await this.prisma.sysUser.findMany({
          where: { userId: { in: userIds } },
          select: { userId: true, nickName: true, phonenumber: true },
        })
      : [];
    const appUsers = userIds.length > 0
      ? await this.prisma.appUser.findMany({
          where: { userId: { in: userIds } },
          select: { userId: true, realName: true, contact: true },
        })
      : [];

    // 构建用户信息Map
    const sysUserMap = new Map(sysUsers.map((u) => [u.userId, u]));
    const appUserMap = new Map(appUsers.map((u) => [u.userId, u]));

    // 格式化返回数据，合并用户信息
    const formattedRows = rows.map((row) => {
      const sysUser = sysUserMap.get(row.userId);
      const appUser = appUserMap.get(row.userId);
      return {
        id: row.id,
        userId: row.userId,
        userType: row.userType,
        content: row.content,
        contact: row.contact,
        images: row.images,
        status: row.status,
        remark: row.remark,
        handleBy: row.handleBy,
        handleTime: row.handleTime,
        createTime: row.createTime,
        nickname: sysUser?.nickName || '',
        phone: sysUser?.phonenumber || '',
        name: appUser?.realName || '',
        userContact: appUser?.contact || '',
      };
    });

    return { rows: formattedRows, total };
  }

  /* 通过ID查询反馈详情 */
  async findById(id: number) {
    const feedback = await this.prisma.appFeedback.findUnique({
      where: { id },
    });

    if (!feedback) return null;

    // 查询用户信息
    let nickname = '';
    let phone = '';
    let name = '';
    let userContact = '';

    if (feedback.userId) {
      const sysUser = await this.prisma.sysUser.findUnique({
        where: { userId: feedback.userId },
        select: { nickName: true, phonenumber: true },
      });
      const appUser = await this.prisma.appUser.findUnique({
        where: { userId: feedback.userId },
        select: { realName: true, contact: true },
      });
      nickname = sysUser?.nickName || '';
      phone = sysUser?.phonenumber || '';
      name = appUser?.realName || '';
      userContact = appUser?.contact || '';
    }

    return {
      id: feedback.id,
      userId: feedback.userId,
      userType: feedback.userType,
      content: feedback.content,
      contact: feedback.contact,
      images: feedback.images,
      status: feedback.status,
      remark: feedback.remark,
      handleBy: feedback.handleBy,
      handleTime: feedback.handleTime,
      createTime: feedback.createTime,
      nickname,
      phone,
      name,
      userContact,
    };
  }

  /* 管理员处理反馈 */
  async update(updateAppFeedbackDto: UpdateAppFeedbackDto, handleBy: string) {
    const { id, status, remark } = updateAppFeedbackDto;
    return await this.prisma.appFeedback.update({
      where: { id },
      data: {
        status,
        remark,
        handleBy,
        handleTime: new Date(),
      },
    });
  }

  /* 删除反馈 */
  async delete(id: number) {
    return await this.prisma.appFeedback.delete({
      where: { id },
    });
  }
}