/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 小程序用户接口
 */
import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AppUserService } from './app-user.service';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { User, UserEnum } from 'src/common/decorators/user.decorator';
import { AjaxResult } from 'src/common/class/ajax-result.class';
import { Public } from 'src/common/decorators/public.decorator';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from 'src/common/decorators/log.decorator';

@ApiTags('app')
@Controller('app/user')
export class AppUserController {
  constructor(private readonly appUserService: AppUserService) {}

  /* 用户注册申请 */
  @Post('register')
  @Public()
  @ApiOperation({ summary: '用户注册申请' })
  @ApiResponse({ status: 200, description: '注册申请成功' })
  async register(@Body() registerDto: any) {
    const result = await this.appUserService.register(registerDto);
    return AjaxResult.success(result);
  }

  /* 申请VIP */
  @Post('applyVip')
  @ApiBearerAuth()
  @ApiOperation({ summary: '申请VIP' })
  @ApiResponse({ status: 200, description: '申请成功' })
  async applyVip(@User(UserEnum.userId) userId: number) {
    const result = await this.appUserService.applyVip(userId);
    return AjaxResult.success(result);
  }

  /* 获取个人信息 */
  @Get('info')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取个人信息' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getInfo(@User(UserEnum.userId) userId: number) {
    const result = await this.appUserService.getInfo(userId);
    return AjaxResult.success(result);
  }

  /* 更新个人信息 */
  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新个人信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateProfile(
    @User(UserEnum.userId) userId: number,
    @Body() updateDto: any,
  ) {
    await this.appUserService.updateProfile(userId, updateDto);
    return AjaxResult.success({ message: '更新成功' });
  }
}

/* 管理员端用户审核接口 */
@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/appUser')
export class AdminAppUserController {
  constructor(private readonly appUserService: AppUserService) {}

  /* 获取待审核注册列表 */
  @Get('registerAudit')
  @RequiresPermissions('admin:appUser:registerAudit')
  @ApiOperation({ summary: '获取待审核注册列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getRegisterAuditList(@Query(PaginationPipe) query: any) {
    return await this.appUserService.getRegisterAuditList(query);
  }

  /* 通过注册 */
  @Post('registerAudit/approve')
  @Log({ title: '注册审核', businessType: BusinessTypeEnum.update })
  @RequiresPermissions('admin:appUser:registerAudit')
  @ApiOperation({ summary: '通过注册' })
  @ApiResponse({ status: 200, description: '审核通过' })
  async approveRegister(
    @Query('userId') userId: number,
    @User(UserEnum.userName) approveBy: string,
  ) {
    await this.appUserService.approveRegister(userId, approveBy);
    return AjaxResult.success({ message: '审核通过' });
  }

  /* 拒绝注册 */
  @Post('registerAudit/reject')
  @Log({ title: '注册审核', businessType: BusinessTypeEnum.update })
  @RequiresPermissions('admin:appUser:registerAudit')
  @ApiOperation({ summary: '拒绝注册' })
  @ApiResponse({ status: 200, description: '已拒绝' })
  async rejectRegister(
    @Query('userId') userId: number,
    @User(UserEnum.userName) approveBy: string,
  ) {
    await this.appUserService.rejectRegister(userId, approveBy);
    return AjaxResult.success({ message: '已拒绝' });
  }

  /* 获取VIP申请列表 */
  @Get('vipAudit')
  @RequiresPermissions('admin:appUser:vipAudit')
  @ApiOperation({ summary: '获取VIP申请列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getVipAuditList(@Query(PaginationPipe) query: any) {
    return await this.appUserService.getVipAuditList(query);
  }

  /* 通过VIP申请 */
  @Post('vipAudit/approve')
  @Log({ title: 'VIP审核', businessType: BusinessTypeEnum.update })
  @RequiresPermissions('admin:appUser:vipAudit')
  @ApiOperation({ summary: '通过VIP申请' })
  @ApiResponse({ status: 200, description: 'VIP审核通过' })
  async approveVip(
    @Query('userId') userId: number,
    @User(UserEnum.userName) approveBy: string,
  ) {
    await this.appUserService.approveVip(userId, approveBy);
    return AjaxResult.success({ message: 'VIP审核通过' });
  }

  /* 拒绝VIP申请 */
  @Post('vipAudit/reject')
  @Log({ title: 'VIP审核', businessType: BusinessTypeEnum.update })
  @RequiresPermissions('admin:appUser:vipAudit')
  @ApiOperation({ summary: '拒绝VIP申请' })
  @ApiResponse({ status: 200, description: '已拒绝VIP申请' })
  async rejectVip(
    @Query('userId') userId: number,
    @User(UserEnum.userName) approveBy: string,
  ) {
    await this.appUserService.rejectVip(userId, approveBy);
    return AjaxResult.success({ message: '已拒绝VIP申请' });
  }

  /* 获取用户列表 */
  @Get('list')
  @RequiresPermissions('admin:appUser:query')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getUserList(@Query(PaginationPipe) query: any) {
    return await this.appUserService.getUserList(query);
  }
}