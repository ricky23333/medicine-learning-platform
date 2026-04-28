/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 馆管理
 */
import { Module } from '@nestjs/common';
import { MuseumController, AppMuseumController } from './museum.controller';
import { MuseumService } from './museum.service';

@Module({
  controllers: [MuseumController, AppMuseumController],
  providers: [MuseumService],
})
export class MuseumModule {}