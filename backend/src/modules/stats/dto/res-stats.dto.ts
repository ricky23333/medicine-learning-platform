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

  @Excel({ name: '考试记录', sort: 6, t: ColumnTypeEnum.string })
  examRecords: string;
}