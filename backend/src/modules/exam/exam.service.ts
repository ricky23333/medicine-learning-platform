/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 考试服务
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from 'src/common/exceptions/api.exception';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

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

    // 随机抽取20张图片（如果不足则全部抽取）
    const availableImages: any[] = [];
    specimens.forEach((specimen) => {
      specimen.images.forEach((image) => {
        availableImages.push({ specimenId: specimen.specimenId, imageId: image.imageId });
      });
    });

    if (availableImages.length === 0) {
      throw new ApiException('没有可用的标本图片');
    }

    // 随机打乱并取20张
    const shuffled = availableImages.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(20, shuffled.length));

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