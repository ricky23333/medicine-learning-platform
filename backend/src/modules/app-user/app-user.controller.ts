/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 小程序用户接口
 */
import { Body, Controller, Get, Post, Put, Query, Param, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AppUserService } from './app-user.service';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { User, UserEnum } from 'src/common/decorators/user.decorator';
import { AjaxResult } from 'src/common/class/ajax-result.class';
import { Public } from 'src/common/decorators/public.decorator';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from 'src/common/decorators/log.decorator';
import { Keep } from 'src/common/decorators/keep.decorator';
import { RepeatSubmit } from 'src/common/decorators/repeat-submit.decorator';
import { ExcelService } from 'src/modules/common/excel/excel.service';
import { StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseFilePipeBuilder } from '@nestjs/common';
import { ApiException } from 'src/common/exceptions/api.exception';
import { ImportAppUserDto } from './dto/req-app-user.dto';
import { ExportUniversityStatsDto, ExportUniversityDetailStatsDto } from './dto/res-app-user.dto';

@ApiTags('app')
@Controller('app/user')
export class AppUserController {
  constructor(private readonly appUserService: AppUserService) { }

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
  async getInfo(@User(UserEnum.userId) userId: number, @Req() request: Request) {
    // 记录访问日志
    const ip = request.ip || request.socket?.remoteAddress || '';
    await this.appUserService.recordVisitLog(userId, ip, '/app/user/info');
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
  constructor(
    private readonly appUserService: AppUserService,
    private readonly excelService: ExcelService,
  ) { }

  /* 下载用户导入模板 */
  @Post('importTemplate')
  @RequiresPermissions('admin:appUser:import')
  @ApiOperation({ summary: '下载用户导入模板' })
  @ApiResponse({ status: 200, description: '模板下载成功' })
  async importTemplate() {
    const file = await this.excelService.importTemplate(ImportAppUserDto);
    return new StreamableFile(file);
  }

  /* 批量导入用户 */
  @Post('importData')
  @RepeatSubmit()
  @RequiresPermissions('admin:appUser:import')
  @Log({ title: '批量导入用户', businessType: BusinessTypeEnum.import })
  @UseInterceptors(FileInterceptor('file'))
  async importData(
    @Query('isUpdateSupport') isUpdateSupport: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
        .addFileTypeValidator({
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .build({
          exceptionFactory: () => new ApiException('文件格式错误！文件最大为5M，且必须是xlsx格式'),
        }),
    ) file: Express.Multer.File,
  ) {
    const data = await this.excelService.import(ImportAppUserDto, file);
    const result = await this.appUserService.batchImport(data, isUpdateSupport === 'true');
    return AjaxResult.success(result);
  }

  /* 获取所有高校统计 */
  @Get('universityStats')
  @RequiresPermissions('admin:appUser:query')
  @ApiOperation({ summary: '获取所有高校统计' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getUniversityStats() {
    const stats = await this.appUserService.getUniversityStats();
    return AjaxResult.success(stats);
  }

  /* 获取特定高校统计 */
  @Get('universityStats/:institution')
  @RequiresPermissions('admin:appUser:query')
  @ApiOperation({ summary: '获取特定高校统计' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getUniversityDetailStats(@Param('institution') institution: string) {
    const stats = await this.appUserService.getUniversityDetailStats(decodeURIComponent(institution));
    return AjaxResult.success(stats);
  }

  /* 导出所有高校统计 */
  @Post('exportUniversities')
  @RepeatSubmit()
  @RequiresPermissions('admin:appUser:export')
  @Log({ title: '导出高校统计', businessType: BusinessTypeEnum.export })
  @Keep()
  @ApiOperation({ summary: '导出所有高校统计' })
  @ApiResponse({ status: 200, description: '导出成功' })
  async exportUniversities() {
    const stats = await this.appUserService.getUniversityStats();
    const file = await this.excelService.export(ExportUniversityStatsDto, stats);
    return new StreamableFile(file);
  }

  /* 导出特定高校详细统计 */
  @Post('exportUniversityDetail')
  @RepeatSubmit()
  @RequiresPermissions('admin:appUser:export')
  @Log({ title: '导出高校详情统计', businessType: BusinessTypeEnum.export })
  @Keep()
  @ApiOperation({ summary: '导出特定高校详细统计' })
  @ApiResponse({ status: 200, description: '导出成功' })
  async exportUniversityDetail(@Query('institution') institution: string) {
    const stats = await this.appUserService.getUniversityDetailStats(decodeURIComponent(institution));
    const file = await this.excelService.export(ExportUniversityDetailStatsDto, stats.gradeDistribution);
    return new StreamableFile(file);
  }

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