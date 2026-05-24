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
  ) { }

  /* 开始考试 - 仅返回题目，不创建考试记录 */
  async startExam(userId: number, startExamDto: any) {
    const { museumId, categoryIds } = startExamDto;
    const intCatIds = categoryIds.map((id) => Number(id));

    // 获取可用的标本图片（已审核的）
    const where: any = {
      status: '0',
      images: { some: { auditStatus: '1' } },
    };
    if (museumId) where.museumId = Number(museumId);
    if (intCatIds && intCatIds.length > 0) {
      where.categoryId = { in: intCatIds };
    }

    const specimens = await this.prisma.specimen.findMany({
      where,
      include: {
        images: { where: { auditStatus: '1' } },
      },
    });

    // 收集所有可用图片，按标本分组
    const specimenImagesMap = new Map<number, any[]>();
    specimens.forEach((specimen) => {
      specimen.images.forEach((image) => {
        const list = specimenImagesMap.get(specimen.specimenId) || [];
        list.push({ specimenId: specimen.specimenId, imageId: image.imageId });
        specimenImagesMap.set(specimen.specimenId, list);
      });
    });

    if (specimenImagesMap.size === 0) {
      throw new ApiException('没有可用的标本图片');
    }

    // 获取当前用户当前museum的历史考试记录中的标本，避免重复标本
    let excludedSpecimenIds: number[] = [];
    if (museumId) {
      const lastExam = await this.prisma.exam.findFirst({
        where: { userId, museumId: Number(museumId), status: '1' },
        orderBy: { examTime: 'desc' },
        include: {
          questions: { select: { specimenId: true } },
        },
      });
      if (lastExam) {
        excludedSpecimenIds = [...new Set(lastExam.questions.map((q) => q.specimenId))];
      }
    }

    // 过滤掉上次考试的标本
    const filteredSpecimenIds = [...specimenImagesMap.keys()].filter(
      (id) => !excludedSpecimenIds.includes(id),
    );

    // 随机打乱标本顺序，每个标本只选一张图片，确保题目来自不同标本
    const questionCount = Number(await this.sysConfigService.oneByconfigKey('global.exam.count')) || 20;
    const shuffledSpecimenIds = filteredSpecimenIds.sort(() => Math.random() - 0.5);
    const selected: any[] = [];

    for (const specimenId of shuffledSpecimenIds) {
      if (selected.length >= questionCount) break;
      const images = specimenImagesMap.get(specimenId)!;
      // 从每个标本的图片中随机选一张
      const randomImage = images[Math.floor(Math.random() * images.length)];
      selected.push(randomImage);
    }

    // 如果未考过的标本图片不足，从已考过的标本中补充
    if (selected.length < questionCount) {
      const usedImageIds = selected.map((s) => s.imageId);
      const otherSpecimenIds = [...specimenImagesMap.keys()].filter(
        (id) => !selected.some((s) => s.specimenId === id),
      );
      const shuffledOther = otherSpecimenIds.sort(() => Math.random() - 0.5);
      for (const specimenId of shuffledOther) {
        if (selected.length >= questionCount) break;
        const images = specimenImagesMap.get(specimenId)!.filter(
          (img) => !usedImageIds.includes(img.imageId),
        );
        if (images.length > 0) {
          const randomImage = images[Math.floor(Math.random() * images.length)];
          selected.push(randomImage);
        }
      }
    }

    // 获取选中图片的详情（缩略图、大图、标本名称作为答案）
    const imageIds = selected.map((s) => s.imageId);
    const images = await this.prisma.specimenImage.findMany({
      where: { imageId: { in: imageIds } },
      include: {
        specimen: { select: { specimenName: true } },
      },
    });

    // 构建题目详情列表（缩略图、大图、答案数组）
    const questions = selected.map((item) => {
      const img = images.find((i) => i.imageId === item.imageId);
      return {
        imageId: item.imageId,
        specimenId: item.specimenId,
        thumbnailUrl: img?.thumbnailUrl || img?.imageUrl || '',
        imageUrl: img?.imageUrl || '',
        // 答案数组：标本名称 + 可能的其他干扰项（这里暂时只返回正确名称）
        answers: img?.specimen?.specimenName ? [img.specimen.specimenName] : [],
      };
    });

    return { totalQuestions: selected.length, questions };
  }

  /* 提交考试 - 创建考试记录和题目，并计算分数 */
  async submitExam(submitDto: any, userId: number) {
    const { questions, answers, museumId } = submitDto;
    // questions: [{imageId, specimenId}], answers: [{imageId, userAnswer}]

    // 创建考试记录
    const exam = await this.prisma.exam.create({
      data: {
        userId,
        museumId: Number(museumId),
        totalQuestions: questions.length,
        status: '0',
      },
    });

    // 获取所有图片的标本信息用于批改
    const imageIds = answers.map((a: any) => a.imageId);
    const images = await this.prisma.specimenImage.findMany({
      where: { imageId: { in: imageIds } },
      include: { specimen: { select: { specimenName: true } } },
    });

    // 创建考试题目并批改
    let correctCount = 0;
    const questionData = answers.map((answer: any, index: number) => {
      const img = images.find((i) => i.imageId === answer.imageId);
      const correctAnswer = img?.specimen?.specimenName?.trim() || '';
      const userAnswer = answer.userAnswer?.trim() || '';
      const isCorrect = userAnswer === correctAnswer;
      if (isCorrect) correctCount++;

      return {
        examId: exam.examId,
        specimenId: answer.specimenId,
        imageId: answer.imageId,
        userAnswer,
        isCorrect,
        sort: index + 1,
      };
    });

    // 批量创建考试题目
    await this.prisma.examQuestion.createMany({
      data: questionData,
    });

    // 更新考试记录
    const score = Math.round((correctCount / answers.length) * 100);
    await this.prisma.exam.update({
      where: { examId: exam.examId },
      data: {
        score,
        correctCount,
        status: '1',
      },
    });

    return { examId: exam.examId, score, correctCount, total: answers.length };
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
      include: { museum: true },
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