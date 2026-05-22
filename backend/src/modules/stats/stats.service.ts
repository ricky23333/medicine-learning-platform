/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 统计服务
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { GetSchoolStatsDto, ExportStudentScoresDto } from './dto/req-stats.dto';
import { SchoolStatsResponse, DailyData, ScoreDistribution, ExportStudentScoreDto } from './dto/res-stats.dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) { }

  /* 获取公开统计（馆、标本、用户总数） */
  async getPublicSummary() {
    const [totalMuseums, totalSpecimens, totalUsers] = await Promise.all([
      this.prisma.museum.count({ where: { status: '0' } }),
      this.prisma.specimen.count({ where: { status: '0' } }),
      this.prisma.appUser.count({ where: { regStatus: '1' } }),
    ]);
    return { totalMuseums, totalSpecimens, totalUsers };
  }

  /* 获取系统概况 */
  async getOverview() {
    const [
      totalVisits, // 总访问次数
      totalUsers, // 总用户数
      totalSpecimenVisits, // 标本被访问总次数
      totalExamCount, // 考试次数
      totalMuseums, // 馆数量
      totalSpecimens, // 标本数量
    ] = await Promise.all([
      this.prisma.appVisitLog.count(),
      this.prisma.appUser.count(),
      this.prisma.specimenVisitLog.count(),
      this.prisma.exam.count(),
      this.prisma.museum.count(),
      this.prisma.specimen.count(),
    ]);

    return {
      totalVisits,
      totalUsers,
      totalSpecimenVisits,
      totalExamCount,
      totalMuseums,
      totalSpecimens,
    };
  }

  /* 获取访问量折线图数据 */
  async getVisitChart(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.appVisitLog.findMany({
      where: { visitTime: { gte: startDate } },
      orderBy: { visitTime: 'asc' },
    });

    // 按天聚合
    const chartData: any[] = [];
    const dayMap = new Map<string, number>();

    logs.forEach((log) => {
      const date = dayjs(log.visitTime).utc().format('YYYY-MM-DD');
      dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });

    dayMap.forEach((count, date) => {
      chartData.push({ date, count });
    });

    return chartData;
  }

  /* 按学校和时间范围获取统计数据 */
  async getSchoolStats(query: GetSchoolStatsDto): Promise<SchoolStatsResponse> {
    // 默认最近一个月
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate
      ? new Date(query.startDate)
      : dayjs().utc().subtract(30, 'day').startOf('day').toDate();

    // 获取部门信息
    let deptWhere: any = { delFlag: '0' };
    if (query.deptId) {
      deptWhere.deptId = query.deptId;
    }

    const depts = await this.prisma.sysDept.findMany({
      where: deptWhere,
      select: { deptId: true, deptName: true },
    });

    const results: SchoolStatsResponse[] = [];

    for (const dept of depts) {
      // 获取该部门的所有用户ID
      const users = await this.prisma.sysUser.findMany({
        where: { deptId: dept.deptId, delFlag: '0' },
        select: { userId: true },
      });
      const userIds = users.map((u) => u.userId);

      // 获取该部门用户数统计（区分教师和学生）
      const teacherCount = await this.prisma.appUser.count({
        where: { userId: { in: userIds }, userType: 'teacher' },
      });
      const studentCount = await this.prisma.appUser.count({
        where: { userId: { in: userIds }, userType: 'student' },
      });

      // 获取考试记录统计
      const examWhere: any = {
        userId: { in: userIds },
        examTime: { gte: startDate, lte: endDate },
        status: '1',
      };

      const totalExams = await this.prisma.exam.count({ where: examWhere });

      // 获取每日考试数据
      const examLogs = await this.prisma.exam.findMany({
        where: examWhere,
        select: { examTime: true },
      });
      const examDailyMap = new Map<string, number>();
      examLogs.forEach((log) => {
        const date = dayjs(log.examTime).utc().format('YYYY-MM-DD');
        examDailyMap.set(date, (examDailyMap.get(date) || 0) + 1);
      });
      const examDailyData: DailyData[] = [];
      examDailyMap.forEach((count, date) => {
        examDailyData.push({ date, count });
      });

      // 获取访问量统计
      const visitWhere: any = {
        userId: { in: userIds },
        visitTime: { gte: startDate, lte: endDate },
      };

      const totalVisits = await this.prisma.appVisitLog.count({ where: visitWhere });

      // 获取每日访问数据
      const visitLogs = await this.prisma.appVisitLog.findMany({
        where: visitWhere,
        select: { visitTime: true },
      });

      const visitDailyMap = new Map<string, number>();
      visitLogs.forEach((log) => {
        const date = dayjs(log.visitTime).utc().format('YYYY-MM-DD');
        visitDailyMap.set(date, (visitDailyMap.get(date) || 0) + 1);
      });
      const visitDailyData: DailyData[] = [];
      visitDailyMap.forEach((count, date) => {
        visitDailyData.push({ date, count });
      });

      // 获取成绩分布
      const examScores = await this.prisma.exam.findMany({
        where: examWhere,
        select: { score: true },
      });

      const scoreDistribution: ScoreDistribution = {
        hundred: examScores.filter((e) => e.score === 100).length,
        ninetyToHundred: examScores.filter((e) => e.score >= 90 && e.score < 100).length,
        eightyToNinety: examScores.filter((e) => e.score >= 80 && e.score < 90).length,
        seventyToEighty: examScores.filter((e) => e.score >= 70 && e.score < 80).length,
        sixtyToSeventy: examScores.filter((e) => e.score >= 60 && e.score < 70).length,
        fiftyToSixty: examScores.filter((e) => e.score >= 50 && e.score < 60).length,
        fortyToFifty: examScores.filter((e) => e.score >= 40 && e.score < 50).length,
        thirtyToForty: examScores.filter((e) => e.score >= 30 && e.score < 40).length,
        twentyToThirty: examScores.filter((e) => e.score >= 20 && e.score < 30).length,
        tenToTwenty: examScores.filter((e) => e.score >= 10 && e.score < 20).length,
        zeroToTen: examScores.filter((e) => e.score < 10).length,
      };

      results.push({
        deptId: dept.deptId,
        deptName: dept.deptName,
        totalExams,
        examDailyData,
        totalVisits,
        visitDailyData,
        scoreDistribution,
        userStats: {
          total: userIds.length,
          teachers: teacherCount,
          students: studentCount,
        },
      });
    }

    return results as any;
  }

  /* 导出学生成绩 */
  async exportStudentScores(query: ExportStudentScoresDto): Promise<ExportStudentScoreDto[]> {
    // 默认最近一个月
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate
      ? new Date(query.startDate)
      : dayjs().utc().subtract(30, 'day').startOf('day').toDate();

    // 获取部门下的所有学生用户ID
    let deptWhere: any = { delFlag: '0' };
    if (query.deptId) {
      deptWhere.deptId = query.deptId;
    }

    const students = await this.prisma.sysUser.findMany({
      where: deptWhere,
      include: {
        appUser: true,
      },
    });

    // 过滤出学生用户
    const studentUsers = students.filter(
      (s) => s.appUser && s.appUser.userType === 'student',
    );

    const results: ExportStudentScoreDto[] = [];

    for (const student of studentUsers) {
      const appUser = student.appUser!;

      // 获取该学生在时间范围内的考试记录
      const exams = await this.prisma.exam.findMany({
        where: {
          userId: student.userId,
          examTime: { gte: startDate, lte: endDate },
          status: '1',
        },
        orderBy: { examTime: 'desc' },
      });

      // 构建考试记录字符串
      const examRecords = exams
        .map((e) => `${dayjs(e.examTime).utc().format('YYYY-MM-DD')}: ${e.score}分`)
        .join('; ');

      // 计算平均成绩
      const avgScore =
        exams.length > 0
          ? Math.round(exams.reduce((sum, e) => sum + e.score, 0) / exams.length)
          : 0;

      results.push({
        studentNo: appUser.studentNo || '',
        realName: appUser.realName || '',
        majorGrade: appUser.majorGrade || '',
        examCount: exams.length,
        avgScore,
        examRecords,
      });
    }

    return results;
  }
}