import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from '../src/modules/exam/exam.service';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from '../src/common/exceptions/api.exception';

describe('ExamService', () => {
  let service: ExamService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    specimen: {
      findMany: jest.fn(),
    },
    exam: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    examQuestion: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startExam', () => {
    it('应该成功开始考试', async () => {
      const mockSpecimens = [
        {
          specimenId: 1,
          specimenName: '白芷',
          images: [{ imageId: 1, imageUrl: '/img1.jpg' }],
        },
        {
          specimenId: 2,
          specimenName: '甘草',
          images: [{ imageId: 2, imageUrl: '/img2.jpg' }],
        },
      ];
      mockPrismaService.specimen.findMany.mockResolvedValue(mockSpecimens);
      mockPrismaService.exam.create.mockResolvedValue({ examId: 1, userId: 1 });
      mockPrismaService.examQuestion.createMany.mockResolvedValue({ count: 2 });

      const result = await service.startExam(1, { museumId: 1, categoryIds: [1] });
      expect(result).toHaveProperty('examId');
      expect(result).toHaveProperty('totalQuestions');
    });

    it('没有可用标本时应该抛出异常', async () => {
      mockPrismaService.specimen.findMany.mockResolvedValue([]);

      await expect(service.startExam(1, { museumId: 1 })).rejects.toThrow(ApiException);
    });
  });

  describe('submitExam', () => {
    it('应该成功提交考试并计算分数', async () => {
      const mockQuestions = [
        { id: 1, imageId: 1, specimen: { specimenName: '白芷' } },
        { id: 2, imageId: 2, specimen: { specimenName: '甘草' } },
      ];
      mockPrismaService.examQuestion.findMany.mockResolvedValue(mockQuestions);
      mockPrismaService.examQuestion.update.mockResolvedValue({});
      mockPrismaService.exam.update.mockResolvedValue({ examId: 1 });

      const result = await service.submitExam(1, {
        answers: [
          { imageId: 1, userAnswer: '白芷' },
          { imageId: 2, userAnswer: '错误答案' },
        ],
      });

      expect(result.score).toBe(50);
      expect(result.correctCount).toBe(1);
      expect(result.total).toBe(2);
    });
  });

  describe('history', () => {
    it('应该返回历史考试记录', async () => {
      const mockExams = [{ examId: 1, score: 80, totalQuestions: 20 }];
      mockPrismaService.exam.findMany.mockResolvedValue(mockExams);
      mockPrismaService.exam.count.mockResolvedValue(1);

      const result = await service.history(1, { skip: 0, take: 10 });
      expect(result.rows).toEqual(mockExams);
      expect(result.total).toBe(1);
    });
  });

  describe('getExamDetail', () => {
    it('应该返回考试详情包含正确答案', async () => {
      const mockExam = { examId: 1, score: 80 };
      const mockQuestions = [
        { id: 1, specimen: { specimenName: '白芷' }, userAnswer: '白芷', isCorrect: true },
        { id: 2, specimen: { specimenName: '甘草' }, userAnswer: '人参', isCorrect: false },
      ];
      mockPrismaService.exam.findFirst.mockResolvedValue(mockExam);
      mockPrismaService.examQuestion.findMany.mockResolvedValue(mockQuestions);

      const result = await service.getExamDetail(1, 1);
      expect(result).toHaveProperty('examId');
      expect(result).toHaveProperty('questions');
      expect(result.questions.length).toBe(2);
    });

    it('不是本人的考试记录应该抛出异常', async () => {
      mockPrismaService.exam.findFirst.mockResolvedValue(null);

      await expect(service.getExamDetail(1, 1)).rejects.toThrow(ApiException);
    });
  });
});