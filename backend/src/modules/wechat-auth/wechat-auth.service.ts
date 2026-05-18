/*
 * @Author: rickyluo
 * @Date: 2024-05-14
 * @Description: 微信小程序登录注册服务
 */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from 'src/common/exceptions/api.exception';
import * as bcrypt from 'bcryptjs';
import { ReqWechatLoginDto, ReqWechatRegisterDto } from './dto/req-wechat-auth.dto';
import { Payload } from '../login/login.interface';

@Injectable()
export class WechatAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /* 微信登录 */
  async wechatLogin(dto: ReqWechatLoginDto) {
    const { code } = dto;

    // 1. 调用微信接口换取 openid
    const openid = await this.getWechatOpenid(code);

    // 2. 根据 openid 查找用户
    let appUser = await this.prisma.appUser.findUnique({
      where: { openid },
      include: { user: true },
    });

    // 3. 如用户不存在，自动创建（待审核状态）
    if (!appUser) {
      const salt = await bcrypt.genSalt();
      const defaultPassword = await bcrypt.hash('888888', salt);

      const user = await this.prisma.sysUser.create({
        data: {
          userName: `wechat_${openid.slice(-10)}`,
          nickName: '微信用户',
          password: defaultPassword,
          status: '0',
          delFlag: '0',
        },
      });

      appUser = await this.prisma.appUser.create({
        data: {
          userId: user.userId,
          openid,
          realName: '微信用户',
          phone: '',
          institution: '',
          userType: 'student',
          regStatus: '0',
          regApplyTime: new Date(),
        },
      });
    }

    // 4. 检查用户是否通过审核
    if (appUser.regStatus === '0') {
      throw new ApiException('账号正在审核中，请耐心等待', 403);
    }

    // 5. 生成JWT token
    const payload: Payload = { userId: appUser.userId, pv: 1 };
    const token = this.jwtService.sign(payload);

    return {
      token,
      userId: appUser.userId,
      userType: appUser.userType,
      realName: appUser.realName,
    };
  }

  /* 微信注册 */
  async wechatRegister(dto: ReqWechatRegisterDto) {
    const { code, phone, realName, userType, institution, majorGrade, studentNo } = dto;

    // 1. 验证微信code换取openid
    const openid = await this.getWechatOpenid(code);

    // 2. 检查手机号是否已注册
    const existingUser = await this.prisma.sysUser.findFirst({
      where: { userName: phone },
    });
    if (existingUser) {
      throw new ApiException('该手机号已注册');
    }

    // 3. 检查openid是否已绑定其他用户
    const existingOpenid = await this.prisma.appUser.findUnique({
      where: { openid },
    });
    if (existingOpenid) {
      throw new ApiException('该微信已绑定其他账号');
    }

    // 4. 创建用户
    const salt = await bcrypt.genSalt();
    const defaultPassword = await bcrypt.hash('888888', salt);

    const user = await this.prisma.sysUser.create({
      data: {
        userName: phone,
        nickName: realName,
        password: defaultPassword,
        phonenumber: phone,
        status: '0',
        delFlag: '0',
      },
    });

    await this.prisma.appUser.create({
      data: {
        userId: user.userId,
        openid,
        userType: userType || 'student',
        realName,
        phone,
        institution: institution || '',
        majorGrade: userType === 'student' ? majorGrade : null,
        studentNo: userType === 'student' ? studentNo : null,
        regStatus: '0',
        regApplyTime: new Date(),
      },
    });

    return { message: '注册申请已提交，请等待管理员审核' };
  }

  /* 调用微信接口获取openid */
  private async getWechatOpenid(code: string): Promise<string> {
    const appid = this.configService.get<string>('wechat.appId');
    const secret = this.configService.get<string>('wechat.appSecret');

    if (!appid || !secret) {
      throw new ApiException('微信配置未正确设置');
    }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    try {
      const axios = require('axios');
      const response = await axios.get(url);
      const data = response.data;

      if (data.errcode) {
        throw new ApiException(`微信登录失败: ${data.errmsg}`);
      }

      return data.openid;
    } catch (error) {
      throw new ApiException('微信服务调用失败');
    }
  }
}