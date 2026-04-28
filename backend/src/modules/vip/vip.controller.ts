/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: VIP教师端接口
 */
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { VipService } from './vip.service';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { User, UserEnum } from 'src/common/decorators/user.decorator';
import { AjaxResult } from 'src/common/class/ajax-result.class';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from 'src/common/decorators/log.decorator';

@ApiTags('vip')
@ApiBearerAuth()
@Controller('vip/specimen')
export class VipController {
  constructor(private readonly vipService: VipService) {}

  /* VIP创建标本 */
  @Post('create')
  @RequiresPermissions('vip:specimen:add')
  @Log({ title: 'VIP标本管理', businessType: BusinessTypeEnum.insert })
  @ApiOperation({ summary: 'VIP创建标本' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createSpecimen(
    @User(UserEnum.userId) userId: number,
    @Body() createDto: any,
  ) {
    const result = await this.vipService.createSpecimen(userId, createDto);
    return AjaxResult.success(result);
  }

  /* VIP上传图片 */
  @Post('image/upload')
  @RequiresPermissions('vip:specimen:image:add')
  @Log({ title: 'VIP图片上传', businessType: BusinessTypeEnum.insert })
  @ApiOperation({ summary: 'VIP上传图片' })
  @ApiResponse({ status: 200, description: '上传成功' })
  async uploadImage(
    @User(UserEnum.userId) userId: number,
    @Body() uploadDto: any,
  ) {
    const result = await this.vipService.uploadImage(userId, uploadDto);
    return AjaxResult.success(result);
  }

  /* VIP删除图片 */
  @Delete('image/:imageId')
  @RequiresPermissions('vip:specimen:image:remove')
  @Log({ title: 'VIP图片删除', businessType: BusinessTypeEnum.delete })
  @ApiOperation({ summary: 'VIP删除图片' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteImage(
    @User(UserEnum.userId) userId: number,
    @Param('imageId') imageId: number,
  ) {
    const result = await this.vipService.deleteImage(userId, imageId);
    return AjaxResult.success(result);
  }

  /* 获取VIP上传的图片列表 */
  @Get('images')
  @RequiresPermissions('vip:specimen:query')
  @ApiOperation({ summary: '获取VIP上传的图片列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getMyImages(
    @User(UserEnum.userId) userId: number,
    @Query(PaginationPipe) query: any,
  ) {
    return await this.vipService.getMyImages(userId, query);
  }

  /* 获取VIP创建的标本列表 */
  @Get('specimens')
  @RequiresPermissions('vip:specimen:query')
  @ApiOperation({ summary: '获取VIP创建的标本列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getMySpecimens(
    @User(UserEnum.userId) userId: number,
    @Query(PaginationPipe) query: any,
  ) {
    return await this.vipService.getMySpecimens(userId, query);
  }
}