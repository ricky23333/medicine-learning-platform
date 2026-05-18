import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ReqWechatLoginDto {
  @ApiProperty({ description: '微信授权code' })
  @IsString()
  code: string;
}

export class ReqWechatRegisterDto {
  @ApiProperty({ description: '微信授权code（可不传，如不传则不绑定openid）', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '手机号（可不传，如不传则必须通过code获取openid）', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '真实姓名' })
  @IsString()
  realName: string;

  @ApiProperty({ description: '用户类型: student | teacher' })
  @IsString()
  userType: string;

  @ApiProperty({ description: '学校/机构' })
  @IsString()
  institution: string;

  @ApiProperty({ description: '专业年级（学生）', required: false })
  @IsOptional()
  @IsString()
  majorGrade?: string;

  @ApiProperty({ description: '学号（学生）', required: false })
  @IsOptional()
  @IsString()
  studentNo?: string;

  @ApiProperty({ description: '组织ID' })
  @IsString()
  deptId: string;
}