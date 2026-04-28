/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 分类管理
 */
import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}