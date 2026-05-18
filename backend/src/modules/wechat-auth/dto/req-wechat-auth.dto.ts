import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ReqWechatLoginDto {
  @ApiProperty({ description: '微信授权code' })
  @IsString()
  code: string;
}

export class ReqWechatRegisterDto {
  @ApiProperty({ description: '微信授权code' })
  @IsString()
  code: string;

  @ApiProperty({ description: '手机号' })
  @IsString()
  phone: string;

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
}