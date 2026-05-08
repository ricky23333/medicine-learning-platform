/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 馆管理
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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MuseumService } from './museum.service';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from 'src/common/decorators/log.decorator';
import { DataObj } from 'src/common/class/data-obj.class';
import { AjaxResult } from 'src/common/class/ajax-result.class';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/museum')
export class MuseumController {
  constructor(private readonly museumService: MuseumService) { }

  /* 新增馆 */
  @Post()
  @Log({ title: '馆管理', businessType: BusinessTypeEnum.insert })
  @RequiresPermissions('admin:museum:add')
  @ApiOperation({ summary: '新增馆' })
  @ApiResponse({ status: 200, description: '新增成功' })
  async add(@Body() createMuseumDto: any) {
    await this.museumService.add(createMuseumDto);
  }

  /* 分页查询馆列表 */
  @Get('list')
  @RequiresPermissions('admin:museum:query')
  @ApiOperation({ summary: '分页查询馆列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async list(@Query(PaginationPipe) query: any) {
    return await this.museumService.list(query);
  }

  /* 查询所有馆（带分类） */
  @Get('all')
  @ApiOperation({ summary: '查询所有馆（带分类）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async listAll() {
    const data = await this.museumService.listWithCategories();
    return AjaxResult.success(data);
  }

  /* 通过ID查询馆 */
  @Get(':museumId')
  @RequiresPermissions('admin:museum:query')
  @ApiOperation({ summary: '通过ID查询馆' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async one(@Param('museumId') museumId: number) {
    const museum = await this.museumService.findById(museumId);
    return DataObj.create(museum);
  }

  /* 更新馆 */
  @Put()
  @Log({ title: '馆管理', businessType: BusinessTypeEnum.update })
  @RequiresPermissions('admin:museum:edit')
  @ApiOperation({ summary: '更新馆' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Body() updateMuseumDto: any) {
    await this.museumService.update(updateMuseumDto);
  }

  /* 删除馆 */
  @Delete(':museumIds')
  @Log({ title: '馆管理', businessType: BusinessTypeEnum.delete })
  @RequiresPermissions('admin:museum:remove')
  @ApiOperation({ summary: '删除馆' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('museumIds') museumIds: string) {
    const ids = museumIds.split(',').map(Number);
    await this.museumService.delete(ids);
  }
}

/* 小程序端馆接口 */
@ApiTags('app')
@Controller('app/museum')
export class AppMuseumController {
  constructor(private readonly museumService: MuseumService) { }

  /* 获取馆列表（带分类） */
  @Get('list')
  @Public()
  @ApiOperation({ summary: '获取馆列表（带分类）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async list() {
    const data = await this.museumService.listWithCategories();
    return AjaxResult.success(data);
  }
}