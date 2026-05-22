/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 分类管理
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
import { CategoryService } from './category.service';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from 'src/common/decorators/log.decorator';
import { DataObj } from 'src/common/class/data-obj.class';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  /* 新增分类 */
  @Post()
  @Log({ title: '分类管理', businessType: BusinessTypeEnum.insert })
  @ApiOperation({ summary: '新增分类' })
  @ApiResponse({ status: 200, description: '新增成功' })
  async add(@Body() createCategoryDto: any) {
    await this.categoryService.add(createCategoryDto);
  }

  /* 分页查询分类列表 */
  @Get('list')
  @ApiOperation({ summary: '分页查询分类列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async list(@Query(PaginationPipe) query: any) {
    return await this.categoryService.list(query);
  }

  /* 通过ID查询分类 */
  @Get(':categoryId')
  @ApiOperation({ summary: '通过ID查询分类' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async one(@Param('categoryId') categoryId: number) {
    const category = await this.categoryService.findById(categoryId);
    return DataObj.create(category);
  }

  /* 更新分类 */
  @Put()
  @Log({ title: '分类管理', businessType: BusinessTypeEnum.update })
  @ApiOperation({ summary: '更新分类' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Body() updateCategoryDto: any) {
    await this.categoryService.update(updateCategoryDto);
  }

  /* 删除分类 */
  @Delete(':categoryIds')
  @Log({ title: '分类管理', businessType: BusinessTypeEnum.delete })
  @RequiresPermissions('admin:category:remove')
  @ApiOperation({ summary: '删除分类' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('categoryIds') categoryIds: string) {
    const ids = categoryIds.split(',').map(Number);
    await this.categoryService.delete(ids);
  }
}