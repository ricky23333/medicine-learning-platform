/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 反馈建议接口
 */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from 'src/common/decorators/log.decorator';
import { DataObj } from 'src/common/class/data-obj.class';
import { AjaxResult } from 'src/common/class/ajax-result.class';
import { Public } from 'src/common/decorators/public.decorator';
import { User, UserEnum } from 'src/common/decorators/user.decorator';

/* 小程序端反馈接口 */
@ApiTags('app')
@Controller('app/feedback')
export class AppFeedbackController {
  constructor(private readonly feedbackService: FeedbackService) { }

  /* 提交反馈建议 */
  @Post()
  @Public()
  @ApiOperation({ summary: '提交反馈建议' })
  @ApiResponse({ status: 200, description: '提交成功' })
  async add(
    @Body() addAppFeedbackDto: any,
    @User(UserEnum.userId) userId?: number,
  ) {
    await this.feedbackService.add(addAppFeedbackDto, userId);
    return AjaxResult.success(null, '提交成功');
  }
}

/* 管理员反馈接口 */
@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/feedback')
export class AdminFeedbackController {
  constructor(private readonly feedbackService: FeedbackService) { }

  /* 分页查询反馈列表 */
  @Get('list')
  @RequiresPermissions('admin:feedback:query')
  @ApiOperation({ summary: '分页查询反馈列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async list(@Query(PaginationPipe) query: any) {
    return await this.feedbackService.list(query);
  }

  /* 通过ID查询反馈 */
  @Get(':id')
  @RequiresPermissions('admin:feedback:query')
  @ApiOperation({ summary: '通过ID查询反馈' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async one(@Param('id') id: number) {
    const feedback = await this.feedbackService.findById(id);
    return DataObj.create(feedback);
  }

  /* 处理反馈 */
  @Put()
  @Log({ title: '反馈管理', businessType: BusinessTypeEnum.update })
  @RequiresPermissions('admin:feedback:edit')
  @ApiOperation({ summary: '处理反馈' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async update(
    @Body() updateAppFeedbackDto: any,
    @User(UserEnum.userName) handleBy?: string,
  ) {
    await this.feedbackService.update(updateAppFeedbackDto, handleBy);
  }
}