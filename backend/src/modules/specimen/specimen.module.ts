/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 标本管理
 */
import { Module } from '@nestjs/common';
import { SpecimenController, AppSpecimenController } from './specimen.controller';
import { SpecimenService } from './specimen.service';

@Module({
  controllers: [SpecimenController, AppSpecimenController],
  providers: [SpecimenService],
})
export class SpecimenModule {}