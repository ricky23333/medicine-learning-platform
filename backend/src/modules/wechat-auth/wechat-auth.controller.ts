/*
 * @Author: rickyluo
 * @Date: 2024-05-14
 * @Description: 微信小程序登录注册控制器
 */
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WechatAuthService } from './wechat-auth.service';
import { ReqWechatLoginDto, ReqWechatRegisterDto } from './dto/req-wechat-auth.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { AjaxResult } from 'src/common/class/ajax-result.class';

@ApiTags('app-auth')
@Controller('app/auth')
export class WechatAuthController {
  constructor(private readonly wechatAuthService: WechatAuthService) {}

  /* 微信登录 */
  @Post('wechat-login')
  @Public()
  @ApiOperation({ summary: '微信登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  async wechatLogin(@Body() dto: ReqWechatLoginDto) {
    const result = await this.wechatAuthService.wechatLogin(dto);
    return AjaxResult.success(result);
  }

  /* 微信注册 */
  @Post('wechat-register')
  @Public()
  @ApiOperation({ summary: '微信注册' })
  @ApiResponse({ status: 200, description: '注册成功' })
  async wechatRegister(@Body() dto: ReqWechatRegisterDto) {
    const result = await this.wechatAuthService.wechatRegister(dto);
    return AjaxResult.success(result);
  }
}