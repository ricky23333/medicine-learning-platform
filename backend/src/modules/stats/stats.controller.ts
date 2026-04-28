/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 统计接口
 */
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { AjaxResult } from 'src/common/class/ajax-result.class';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

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
}