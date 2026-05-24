/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 标本管理
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SpecimenService } from './specimen.service';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from 'src/common/decorators/log.decorator';
import { DataObj } from 'src/common/class/data-obj.class';
import { AjaxResult } from 'src/common/class/ajax-result.class';
import { Public } from 'src/common/decorators/public.decorator';
import { User, UserEnum } from 'src/common/decorators/user.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/specimen')
export class SpecimenController {
  constructor(private readonly specimenService: SpecimenService) { }

  /* 新增标本 */
  @Post()
  @Log({ title: '标本管理', businessType: BusinessTypeEnum.insert })
  @RequiresPermissions('admin:specimen:add')
  @ApiOperation({ summary: '新增标本' })
  @ApiResponse({ status: 200, description: '新增成功' })
  async add(@Body() createSpecimenDto: any) {
    await this.specimenService.add(createSpecimenDto);
  }

  /* 分页查询标本列表 */
  @Get('list')
  @ApiOperation({ summary: '分页查询标本列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async list(@Query(PaginationPipe) query: any) {
    return await this.specimenService.list(query);
  }

  /* 通过ID查询标本 */
  @Get(':specimenId')
  @ApiOperation({ summary: '通过ID查询标本' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async one(@Param('specimenId') specimenId: number) {
    const specimen = await this.specimenService.findById(specimenId);
    return DataObj.create(specimen);
  }

  /* 更新标本 */
  @Put()
  @Log({ title: '标本管理', businessType: BusinessTypeEnum.update })
  @ApiOperation({ summary: '更新标本' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Body() updateSpecimenDto: any) {
    await this.specimenService.update(updateSpecimenDto);
  }

  /* 删除标本 */
  @Delete(':specimenIds')
  @Log({ title: '标本管理', businessType: BusinessTypeEnum.delete })
  @RequiresPermissions('admin:specimen:remove')
  @ApiOperation({ summary: '删除标本' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('specimenIds') specimenIds: string) {
    const ids = specimenIds.split(',').map(Number);
    await this.specimenService.delete(ids);
  }

  /* 上传标本图片 */
  @Post('image')
  @Log({ title: '标本图片', businessType: BusinessTypeEnum.insert })
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
  }))
  @ApiOperation({ summary: '上传标本图片' })
  @ApiResponse({ status: 200, description: '上传成功' })
  async addImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImageDto: any,
  ) {
    await this.specimenService.addImage(file, createImageDto);
  }

  /* 删除标本图片 */
  @Delete('image/:imageId')
  @Log({ title: '标本图片', businessType: BusinessTypeEnum.delete })
  // @RequiresPermissions('admin:specimen:image:remove')
  @ApiOperation({ summary: '删除标本图片' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteImage(
    @Param('imageId') imageId: number,
    @User(UserEnum.userId) userId?: number,
    @User(UserEnum.roles) roles?: string[],
  ) {
    await this.specimenService.deleteImage(imageId, userId, roles);
  }

  /* 审核图片 */
  @Post('image/audit')
  @Log({ title: '图片审核', businessType: BusinessTypeEnum.update })
  @RequiresPermissions('admin:specimen:image:audit')
  @ApiOperation({ summary: '审核图片' })
  @ApiResponse({ status: 200, description: '审核成功' })
  async auditImage(@Body() auditDto: any) {
    await this.specimenService.auditImage(auditDto);
  }

  /* 修改图片审核备注 */
  @Put('image/remark')
  @Log({ title: '修改图片审核备注', businessType: BusinessTypeEnum.update })
  @ApiOperation({ summary: '修改图片审核备注' })
  @ApiResponse({ status: 200, description: '修改成功' })
  async updateImageRemark(@Body() updateRemarkDto: { imageId: number; auditRemark: string }) {
    await this.specimenService.updateImageRemark(updateRemarkDto);
  }
}

/* 小程序端标本接口 */
@ApiTags('app')
@Controller('app/specimen')
export class AppSpecimenController {
  constructor(private readonly specimenService: SpecimenService) { }

  /* 分页查询标本（模糊搜索、分类筛选） */
  @Get('list')
  @Public()
  @ApiOperation({ summary: '分页查询标本（模糊搜索、分类筛选）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async list(@Query(PaginationPipe) query: any) {
    return await this.specimenService.listForApp(query);
  }

  /* 获取标本详情 */
  @Get(':specimenId')
  @ApiOperation({ summary: '获取标本详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async one(
    @Param('specimenId') specimenId: number,
    @User(UserEnum.userId) userId?: number,
  ) {
    const specimen = await this.specimenService.findById(specimenId, true);
    // 记录标本访问
    await this.specimenService.recordVisit(specimenId, userId);
    return AjaxResult.success(specimen);
  }
}