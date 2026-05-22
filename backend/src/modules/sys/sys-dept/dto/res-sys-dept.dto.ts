/*
 * @Author: jiang.sheng 87789771@qq.com
 * @Date: 2024-05-12 17:37:21
 * @LastEditors: jiang.sheng 87789771@qq.com
 * @LastEditTime: 2024-05-12 17:57:31
 * @FilePath: /meimei-new/src/modules/sys/sys-dept/dto/res-sys-dept.dto.ts
 * @Description:
 *
 */
import { Excel } from 'src/modules/common/excel/excel.decorator';
import { ColumnTypeEnum } from 'src/modules/common/excel/excel.enum';

export class ExportDeptUserStatisticsDto {
  @Excel({ name: '部门ID', sort: 1, t: ColumnTypeEnum.number })
  deptId: number;

  @Excel({ name: '上级部门ID', sort: 2, t: ColumnTypeEnum.number })
  parentId: number;

  @Excel({ name: '部门名称', sort: 3, t: ColumnTypeEnum.string })
  deptName: string;

  @Excel({ name: '教师数量', sort: 4, t: ColumnTypeEnum.number })
  teacherCount: number;

  @Excel({ name: '学生数量', sort: 5, t: ColumnTypeEnum.number })
  studentCount: number;

  @Excel({ name: '用户总数', sort: 6, t: ColumnTypeEnum.number })
  total: number;
}
