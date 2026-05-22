/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 统计接口
 */
import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { ExcelService } from 'src/modules/common/excel/excel.service';
import { StreamableFile } from '@nestjs/common';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from 'src/common/decorators/log.decorator';
import { Keep } from 'src/common/decorators/keep.decorator';
import { RepeatSubmit } from 'src/common/decorators/repeat-submit.decorator';
import { AjaxResult } from 'src/common/class/ajax-result.class';
import { Public } from 'src/common/decorators/public.decorator';
import { GetSchoolStatsDto, ExportStudentScoresDto } from './dto/req-stats.dto';
import { ExportStudentScoreDto } from './dto/res-stats.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly excelService: ExcelService,
  ) { }

  /* 获取系统概况 */
  @Get('overview')
  @RequiresPermissions('admin:stats:query')
  @ApiOperation({ summary: '获取系统概况' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getOverview() {
    const result = await this.statsService.getOverview();
    return AjaxResult.success(result);
  }

  /* 获取访问量折线图数据 */
  @Get('visitChart')
  @RequiresPermissions('admin:stats:query')
  @ApiOperation({ summary: '获取访问量折线图数据' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getVisitChart(@Query('days') days?: number) {
    const result = await this.statsService.getVisitChart(days || 7);
    return AjaxResult.success(result);
  }

  /* 按学校和时间范围获取统计数据 */
  @Get('schoolStats')
  @RequiresPermissions('admin:stats:query')
  @ApiOperation({ summary: '按学校和时间范围获取统计数据' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getSchoolStats(@Query() query: GetSchoolStatsDto) {
    console.log(3333, query);
    const result = await this.statsService.getSchoolStats(query);
    return AjaxResult.success(result);
  }

  /* 导出学生成绩 */
  @RepeatSubmit()
  @Post('exportStudentScores')
  @RequiresPermissions('admin:stats:export')
  @Log({ title: '学生成绩统计', businessType: BusinessTypeEnum.export })
  @Keep()
  @ApiOperation({ summary: '导出学生成绩Excel' })
  @ApiResponse({ status: 200, description: '导出成功' })
  async exportStudentScores(@Query() query: ExportStudentScoresDto): Promise<StreamableFile> {
    const data = await this.statsService.exportStudentScores(query);
    const file = await this.excelService.export(ExportStudentScoreDto, data);
    return new StreamableFile(file);
  }
}

/* 公开统计接口 */
@ApiTags('public')
@Controller('public/stats')
export class PublicStatsController {
  constructor(private readonly statsService: StatsService) { }

  /* 获取馆、标本、用户总数 */
  @Get('summary')
  @Public()
  @ApiOperation({ summary: '获取馆、标本、用户总数' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getPublicSummary() {
    const result = await this.statsService.getPublicSummary();
    return AjaxResult.success(result);
  }
}