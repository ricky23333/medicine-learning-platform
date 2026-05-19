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
    const { status, content, userId, skip = 0, take = 10 } = getAppFeedbackListDto;
    const where: any = {};
    if (status) where.status = status;
    if (content) where.content = { contains: content };
    if (userId) where.userId = userId;

    const [rows, total] = await Promise.all([
      this.prisma.appFeedback.findMany({
        where,
        skip,
        take: Number(take),
        orderBy: { createTime: 'desc' },
      }),
      this.prisma.appFeedback.count({ where }),
    ]);
    return { rows, total };
  }

  /* 通过ID查询反馈详情 */
  async findById(id: number) {
    return await this.prisma.appFeedback.findUnique({
      where: { id },
    });
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
}