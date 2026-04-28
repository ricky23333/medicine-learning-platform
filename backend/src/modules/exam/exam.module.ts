/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 考试模块
 */
import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';

@Module({
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}