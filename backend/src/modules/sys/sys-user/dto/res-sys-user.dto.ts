import { ColumnTypeEnum } from 'src/modules/common/excel/excel.enum';
import { Excel } from 'src/modules/common/excel/excel.decorator';
import { IsOptional, IsString } from 'class-validator';

export class ExportSysUserDto {
  /* 院校 */
  @Excel({
    name: '院校',
    formatter: (value: any, row: any) => row.dept?.deptName || '',
  })
  @IsString()
  institution: string;

  /* 专业 */
  @Excel({
    name: '专业',
    formatter: (value: any, row: any) => {
      const majorGrade = row.appUser?.majorGrade || '';
      // majorGrade 格式: "专业-年级" 或只有"专业"
      const parts = majorGrade.split('-');
      return parts[0] || '';
    },
  })
  @IsString()
  major: string;

  /* 年级 */
  @Excel({
    name: '年级',
    formatter: (value: any, row: any) => {
      const majorGrade = row.appUser?.majorGrade || '';
      const parts = majorGrade.split('-');
      return parts[1] || '';
    },
  })
  @IsString()
  grade: string;

  /* 姓名 */
  @Excel({ name: '姓名' })
  @IsString()
  nickName: string;

  /* 学号 */
  @Excel({
    name: '学号',
    formatter: (value: any, row: any) => row.appUser?.studentNo || '',
  })
  @IsOptional()
  @IsString()
  studentNo?: string;

  /* 身份证号 */
  @Excel({
    name: '身份证号',
    formatter: (value: any, row: any) => row.appUser?.identity || '',
  })
  @IsOptional()
  @IsString()
  identity?: string;

  /* 手机号 */
  @Excel({
    name: '手机号',
    formatter: (value: any, row: any) => row.appUser?.phone || '',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}