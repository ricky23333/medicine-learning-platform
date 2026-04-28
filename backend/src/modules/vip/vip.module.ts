/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: VIP教师端接口
 */
import { Module } from '@nestjs/common';
import { VipController } from './vip.controller';
import { VipService } from './vip.service';

@Module({
  controllers: [VipController],
  providers: [VipService],
})
export class VipModule {}