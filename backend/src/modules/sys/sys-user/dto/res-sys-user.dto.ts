import { AddSysUserDto } from './req-sys-user.dto';
import { ColumnTypeEnum } from 'src/modules/common/excel/excel.enum';
import { Excel } from 'src/modules/common/excel/excel.decorator';
import { IsOptional, IsString } from 'class-validator';

export class ExportSysUserDto {
  /* 用户账号 */
  @Excel({ name: '用户账号' })
  @IsString()
  userName: string;

  /* 用户昵称 */
  @Excel({ name: '用户昵称' })
  @IsString()
  nickName: string;

  /* 手机号码 */
  @Excel({
    name: '手机号码',
    formatter: (value: any, row: any) => row.appUser?.phonenumber,
  })
  @IsOptional()
  @IsString()
  phonenumber?: string;

  /* 联系方式 */
  @Excel({
    name: '联系方式',
    formatter: (value: any, row: any) => row.appUser?.contact,
  })
  @IsOptional()
  @IsString()
  contact?: string;

  /* 用户类型 */
  @Excel({
    name: '用户类型',
    formatter: (value: any, row: any) => row.appUser?.userType,
  })
  @IsOptional()
  @IsString()
  userType?: string;

  /* 年级班级 */
  @Excel({
    name: '年级班级',
    formatter: (value: any, row: any) => row.appUser?.majorGrade,
  })
  @IsOptional()
  @IsString()
  majorGrade?: string;

  /* 学号 */
  @Excel({
    name: '学号',
    formatter: (value: any, row: any) => row.appUser?.studentNo,
  })
  @IsOptional()
  @IsString()
  studentNo?: string;

  /* 用户邮箱 */
  @Excel({ name: '用户邮箱' })
  @IsOptional()
  @IsString()
  email?: string;

  /* 帐号状态 */
  @Excel({ name: '帐号状态', dictType: 'sys_normal_disable' })
  @IsString()
  status: string;

  /* 用户部门 */
  @Excel({ name: '所属部门id', t: ColumnTypeEnum.number })
  deptId: number;
}
