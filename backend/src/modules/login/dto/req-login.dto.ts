import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class ReqLoginDto {
  /* uuid码 */
  @IsString()
  uuid: string;

  /* 验证码code */
  @IsString()
  code: string;

  /* 用户名 */
  @IsString()
  username: string;

  /* 密码 */
  @IsString()
  password: string;

  /* 是否后台管理系统登录 */
  @IsOptional()
  @IsBoolean()
  isAdminLogin?: boolean;
}