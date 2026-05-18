/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 考试服务
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from 'src/common/exceptions/api.exception';
import { SysConfigService } from '../sys/sys-config/sys-config.service';

@Injectable()
export class ExamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sysConfigService: SysConfigService,
  ) {}

  /* 开始考试 */
  async startExam(userId: number, startExamDto: any) {
    const { museumId, categoryIds } = startExamDto;

    // 获取可用的标本图片（已审核的）
    const where: any = {
      status: '0',
      images: { some: { auditStatus: '0' } },
    };
    if (museumId) where.museumId = museumId;
    if (categoryIds && categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }

    const specimens = await this.prisma.specimen.findMany({
      where,
      include: {
        images: { where: { auditStatus: '0' } },
      },
    });

    // 收集所有可用图片
    const availableImages: any[] = [];
    specimens.forEach((specimen) => {
      specimen.images.forEach((image) => {
        availableImages.push({ specimenId: specimen.specimenId, imageId: image.imageId });
      });
    });

    if (availableImages.length === 0) {
      throw new ApiException('没有可用的标本图片');
    }

    // 查找当前用户当前museum上次的历史考试记录，避免重复题目
    let excludedImageIds: number[] = [];
    if (museumId) {
      const lastExam = await this.prisma.exam.findFirst({
        where: { userId, museumId, status: '1' },
        orderBy: { examTime: 'desc' },
        include: {
          questions: { select: { imageId: true } },
        },
      });
      if (lastExam) {
        excludedImageIds = lastExam.questions.map((q) => q.imageId);
      }
    }

    // 过滤掉上次考试的题目
    const filteredImages = availableImages.filter(
      (img) => !excludedImageIds.includes(img.imageId),
    );

    // 随机打乱并取N张（优先从未考过的图片中选取，如果不够则补充已考过的）
    const questionCount = Number(await this.sysConfigService.oneByconfigKey('global.exam.count')) || 20;
    const shuffled = filteredImages.sort(() => Math.random() - 0.5);
    let selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    // 如果未考过的图片不足，从已考过的图片中补充
    if (selected.length < questionCount) {
      const otherImages = availableImages
        .filter((img) => !selected.some((s) => s.imageId === img.imageId))
        .sort(() => Math.random() - 0.5);
      const needed = questionCount - selected.length;
      selected = [...selected, ...otherImages.slice(0, needed)];
    }

    // 创建考试记录
    const exam = await this.prisma.exam.create({
      data: {
        userId,
        museumId,
        totalQuestions: selected.length,
        status: '0',
      },
    });

    // 创建考试题目
    await this.prisma.examQuestion.createMany({
      data: selected.map((item, index) => ({
        examId: exam.examId,
        specimenId: item.specimenId,
        imageId: item.imageId,
        sort: index + 1,
      })),
    });

    return { examId: exam.examId, totalQuestions: selected.length };
  }

  /* 提交考试 */
  async submitExam(examId: number, submitDto: any) {
    const { answers } = submitDto; // answers: [{imageId, userAnswer}]

    // 获取考试题目
    const questions = await this.prisma.examQuestion.findMany({
      where: { examId },
      include: { specimen: true },
    });

    let correctCount = 0;

    // 更新每道题的答案
    for (const question of questions) {
      const answer = answers.find((a: any) => a.imageId === question.imageId);
      const userAnswer = answer?.userAnswer || '';
      // 简单的匹配逻辑：去掉空格后比较
      const isCorrect =
        userAnswer.trim() === question.specimen.specimenName.trim();
      if (isCorrect) correctCount++;

      await this.prisma.examQuestion.update({
        where: { id: question.id },
        data: { userAnswer, isCorrect },
      });
    }

    // 更新考试记录
    const score = Math.round((correctCount / questions.length) * 100);
    await this.prisma.exam.update({
      where: { examId },
      data: {
        score,
        correctCount,
        status: '1',
      },
    });

    return { score, correctCount, total: questions.length };
  }

  /* 获取历史考试记录 */
  async history(userId: number, query: any) {
    const { skip = 0, take = 10 } = query;
    const [rows, total] = await Promise.all([
      this.prisma.exam.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { examTime: 'desc' },
        include: { museum: true },
      }),
      this.prisma.exam.count({ where: { userId } }),
    ]);
    return { rows, total };
  }

  /* 获取考试详情（含正确答案） */
  async getExamDetail(examId: number, userId: number) {
    const exam = await this.prisma.exam.findFirst({
      where: { examId, userId },
    });
    if (!exam) throw new ApiException('考试记录不存在');

    const questions = await this.prisma.examQuestion.findMany({
      where: { examId },
      orderBy: { sort: 'asc' },
      include: {
        specimen: true,
      },
    });

    return { ...exam, questions };
  }
}