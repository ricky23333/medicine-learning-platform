/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 统计服务
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

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
      const date = log.visitTime.toISOString().split('T')[0];
      dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });

    dayMap.forEach((count, date) => {
      chartData.push({ date, count });
    });

    return chartData;
  }
}