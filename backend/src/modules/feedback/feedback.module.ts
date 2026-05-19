/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 反馈建议模块
 */
import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { AppFeedbackController, AdminFeedbackController } from './feedback.controller';

@Module({
  controllers: [AppFeedbackController, AdminFeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}