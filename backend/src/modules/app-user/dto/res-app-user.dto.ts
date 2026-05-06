/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 小程序用户导出DTO
 */
import { Excel } from 'src/modules/common/excel/excel.decorator';
import { ColumnTypeEnum } from 'src/modules/common/excel/excel.enum';

/* 高校统计导出DTO */
export class ExportUniversityStatsDto {
  @Excel({ name: '学校/机构', sort: 1, t: ColumnTypeEnum.string })
  institution: string;

  @Excel({ name: '用户数量', sort: 2, t: ColumnTypeEnum.number })
  userCount: number;
}

/* 高校详情统计导出DTO */
export class ExportUniversityDetailStatsDto {
  @Excel({ name: '专业年级', sort: 1, t: ColumnTypeEnum.string })
  majorGrade: string;

  @Excel({ name: '学生数量', sort: 2, t: ColumnTypeEnum.number })
  studentCount: number;
}