/*
 * @Author: JiangSheng 87789771@qq.com
 * @Date: 2024-04-22 08:52:21
 * @LastEditors: JiangSheng 87789771@qq.com
 * @LastEditTime: 2024-04-30 14:44:17
 * @FilePath: \meimei-new\src\app.module.ts
 * @Description:根模块
 *
 */
import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { AppController } from './app.controller';
import { SysModule } from './modules/sys/sys.module';
import { LoginModule } from './modules/login/login.module';
import { MonitorModule } from './modules/monitor/monitor.module';
import { CommonModule } from './modules/common/common.module';
import { MuseumModule } from './modules/museum/museum.module';
import { CategoryModule } from './modules/category/category.module';
import { SpecimenModule } from './modules/specimen/specimen.module';
import { ExamModule } from './modules/exam/exam.module';
import { StatsModule } from './modules/stats/stats.module';
import { AppUserModule } from './modules/app-user/app-user.module';
import { VipModule } from './modules/vip/vip.module';
import { WechatAuthModule } from './modules/wechat-auth/wechat-auth.module';
import { FeedbackModule } from './modules/feedback/feedback.module';

@Module({
  imports: [
    SharedModule,
    CommonModule,
    SysModule,
    LoginModule,
    MonitorModule,
    MuseumModule,
    CategoryModule,
    SpecimenModule,
    ExamModule,
    StatsModule,
    AppUserModule,
    VipModule,
    WechatAuthModule,
    FeedbackModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
