/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 考试接口
 */
import { Body, Controller, Get, Post, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ExamService } from './exam.service';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { User, UserEnum } from 'src/common/decorators/user.decorator';
import { AjaxResult } from 'src/common/class/ajax-result.class';

@ApiTags('app')
@ApiBearerAuth()
@Controller('app/exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  /* 开始考试 */
  @Post('start')
  @ApiOperation({ summary: '开始考试' })
  @ApiResponse({ status: 200, description: '考试开始成功' })
  async startExam(@User(UserEnum.userId) userId: number, @Body() startExamDto: any) {
    const result = await this.examService.startExam(userId, startExamDto);
    return AjaxResult.success(result);
  }

  /* 提交考试 */
  @Post('submit')
  @ApiOperation({ summary: '提交考试答案' })
  @ApiResponse({ status: 200, description: '提交成功' })
  async submitExam(
    @User(UserEnum.userId) userId: number,
    @Body() submitDto: any,
  ) {
    const result = await this.examService.submitExam(submitDto.examId, submitDto);
    return AjaxResult.success(result);
  }

  /* 获取历史考试记录 */
  @Get('history')
  @ApiOperation({ summary: '获取历史考试记录' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async history(@User(UserEnum.userId) userId: number, @Query(PaginationPipe) query: any) {
    return await this.examService.history(userId, query);
  }

  /* 获取考试详情（含正确答案） */
  @Get(':examId')
  @ApiOperation({ summary: '获取考试详情（含正确答案）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getDetail(
    @User(UserEnum.userId) userId: number,
    @Param('examId') examId: number,
  ) {
    const result = await this.examService.getExamDetail(examId, userId);
    return AjaxResult.success(result);
  }
}