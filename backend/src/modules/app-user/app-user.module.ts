/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 小程序用户模块
 */
import { Module } from '@nestjs/common';
import { AppUserController, AdminAppUserController } from './app-user.controller';
import { AppUserService } from './app-user.service';
import { ExcelModule } from 'src/modules/common/excel/excel.module';

@Module({
  imports: [ExcelModule],
  controllers: [AppUserController, AdminAppUserController],
  providers: [AppUserService],
})
export class AppUserModule {}