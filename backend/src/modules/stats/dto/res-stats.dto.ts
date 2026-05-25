/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 统计响应 DTO
 */
import { Excel } from 'src/modules/common/excel/excel.decorator';
import { ColumnTypeEnum } from 'src/modules/common/excel/excel.enum';

/* 学校统计响应 */
export class SchoolStatsResponse {
  deptId: number;
  deptName: string;
  totalExams: number;         // 总考试次数
  examDailyData: DailyData[]; // 每日考试次数
  totalVisits: number;        // 总访问量
  visitDailyData: DailyData[]; // 每日访问量
  scoreDistribution: ScoreDistribution; // 成绩分布
  userStats: {
    total: number;    // 总用户数
    teachers: number; // 教师数
    students: number; // 学生数
  };
}

export class DailyData {
  date: string;
  count: number;
}

export class ScoreDistribution {
  hundred: number;      // 100分
  ninetyToHundred: number;  // 90-99分
  eightyToNinety: number;    // 80-89分
  seventyToEighty: number;   // 70-79分
  sixtyToSeventy: number;    // 60-69分
  fiftyToSixty: number;      // 50-59分
  fortyToFifty: number;     // 40-49分
  thirtyToForty: number;    // 30-39分
  twentyToThirty: number;    // 20-29分
  tenToTwenty: number;      // 10-19分
  zeroToTen: number;         // 0-9分
}

/* 导出学生成绩 DTO */
export class ExportStudentScoreDto {
  @Excel({ name: '学号', sort: 1, t: ColumnTypeEnum.string })
  studentNo: string;

  @Excel({ name: '姓名', sort: 2, t: ColumnTypeEnum.string })
  realName: string;

  @Excel({ name: '专业班级', sort: 3, t: ColumnTypeEnum.string })
  majorGrade: string;

  @Excel({ name: '考试次数', sort: 4, t: ColumnTypeEnum.number })
  examCount: number;

  @Excel({ name: '平均成绩', sort: 5, t: ColumnTypeEnum.number })
  avgScore: number;

  // 动态考试记录字段 - 每次考试拆分为：时间、成绩、标本目录
  @Excel({ name: '考试1时间', sort: 6, t: ColumnTypeEnum.string })
  exam1Time?: string;

  @Excel({ name: '考试1成绩', sort: 7, t: ColumnTypeEnum.number })
  exam1Score?: number;

  @Excel({ name: '考试1标本目录', sort: 8, t: ColumnTypeEnum.string })
  exam1MuseumName?: string;

  @Excel({ name: '考试2时间', sort: 9, t: ColumnTypeEnum.string })
  exam2Time?: string;

  @Excel({ name: '考试2成绩', sort: 10, t: ColumnTypeEnum.number })
  exam2Score?: number;

  @Excel({ name: '考试2标本目录', sort: 11, t: ColumnTypeEnum.string })
  exam2MuseumName?: string;

  @Excel({ name: '考试3时间', sort: 12, t: ColumnTypeEnum.string })
  exam3Time?: string;

  @Excel({ name: '考试3成绩', sort: 13, t: ColumnTypeEnum.number })
  exam3Score?: number;

  @Excel({ name: '考试3标本目录', sort: 14, t: ColumnTypeEnum.string })
  exam3MuseumName?: string;

  @Excel({ name: '考试4时间', sort: 15, t: ColumnTypeEnum.string })
  exam4Time?: string;

  @Excel({ name: '考试4成绩', sort: 16, t: ColumnTypeEnum.number })
  exam4Score?: number;

  @Excel({ name: '考试4标本目录', sort: 17, t: ColumnTypeEnum.string })
  exam4MuseumName?: string;

  @Excel({ name: '考试5时间', sort: 18, t: ColumnTypeEnum.string })
  exam5Time?: string;

  @Excel({ name: '考试5成绩', sort: 19, t: ColumnTypeEnum.number })
  exam5Score?: number;

  @Excel({ name: '考试5标本目录', sort: 20, t: ColumnTypeEnum.string })
  exam5MuseumName?: string;
}