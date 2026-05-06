/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 小程序用户导入DTO
 */
import { IsString, IsIn, IsOptional } from 'class-validator';
import { Excel } from 'src/modules/common/excel/excel.decorator';
import { ColumnTypeEnum, ExcelTypeEnum } from 'src/modules/common/excel/excel.enum';

export class ImportAppUserDto {
  @Excel({ name: '手机号', type: ExcelTypeEnum.IMPORT, sort: 1, t: ColumnTypeEnum.string })
  @IsString()
  userName: string;

  @Excel({ name: '密码', type: ExcelTypeEnum.IMPORT, sort: 2, t: ColumnTypeEnum.string })
  @IsString()
  @IsOptional()
  password?: string;

  @Excel({ name: '真实姓名', type: ExcelTypeEnum.IMPORT, sort: 3, t: ColumnTypeEnum.string })
  @IsString()
  realName: string;

  @Excel({ name: '学校/机构', type: ExcelTypeEnum.IMPORT, sort: 4, t: ColumnTypeEnum.string })
  @IsString()
  institution: string;

  @Excel({ name: '用户类型', type: ExcelTypeEnum.IMPORT, sort: 5, t: ColumnTypeEnum.string })
  @IsString()
  @IsIn(['student', 'teacher'])
  userType: string;

  @Excel({ name: '专业年级', type: ExcelTypeEnum.IMPORT, sort: 6, t: ColumnTypeEnum.string })
  @IsString()
  @IsOptional()
  majorGrade?: string;

  @Excel({ name: '学号', type: ExcelTypeEnum.IMPORT, sort: 7, t: ColumnTypeEnum.string })
  @IsString()
  @IsOptional()
  studentNo?: string;

  @Excel({ name: '联系方式', type: ExcelTypeEnum.IMPORT, sort: 8, t: ColumnTypeEnum.string })
  @IsString()
  @IsOptional()
  contact?: string;
}