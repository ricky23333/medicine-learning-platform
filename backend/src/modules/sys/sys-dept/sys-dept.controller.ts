/*
 * @Author: jiang.sheng 87789771@qq.com
 * @Date: 2024-05-12 17:35:00
 * @LastEditors: jiang.sheng 87789771@qq.com
 * @LastEditTime: 2024-05-16 21:10:31
 * @FilePath: /meimei-new/src/modules/sys/sys-dept/sys-dept.controller.ts
 * @Description:
 *
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SysDeptService } from './sys-dept.service';
import { ExcelService } from 'src/modules/common/excel/excel.service';
import { StreamableFile } from '@nestjs/common';
import { RepeatSubmit } from 'src/common/decorators/repeat-submit.decorator';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { CreateMessagePipe } from 'src/common/pipes/createmessage.pipe';
import { BusinessTypeEnum, Log } from 'src/common/decorators/log.decorator';
import { DataObj } from 'src/common/class/data-obj.class';
import { UpdateMessagePipe } from 'src/common/pipes/updatemessage.pipe';
import { Keep } from 'src/common/decorators/keep.decorator';
import {
  AddSysDeptDto,
  GetSysDeptListDto,
  UpdateSysDeptDto,
} from './dto/req-sys-dept.dto';
import { ExportDeptUserStatisticsDto } from './dto/res-sys-dept.dto';
import { User, UserEnum } from 'src/common/decorators/user.decorator';
import { DataScope } from 'src/common/type/data-scope.type';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('system/dept')
export class SysDeptController {
  constructor(
    private readonly sysDeptService: SysDeptService,
    private readonly excelService: ExcelService,
  ) { }

  /* 公开接口：获取所有组织（id, parentId, deptName） */
  @Get('public/list')
  @Public()
  async publicList() {
    return await this.sysDeptService.publicList();
  }

  /* 新增 */
  @Post()
  @RepeatSubmit()
  @Log({
    title: '部门管理',
    businessType: BusinessTypeEnum.insert,
  })
  @RequiresPermissions('system:dept:add')
  async add(@Body(CreateMessagePipe) addSysDeptDto: AddSysDeptDto) {
    await this.sysDeptService.add(addSysDeptDto);
  }

  /* 列表查询 */
  @Get('list')
  @RequiresPermissions('system:dept:query')
  async list(
    @Query() getSysDeptListDto: GetSysDeptListDto,
    @User(UserEnum.dataScope) dataScope: DataScope,
  ) {
    return await this.sysDeptService.list(getSysDeptListDto, dataScope);
  }

  /* 查询出去这个id及其子部门外的其他部门 */
  @Get('list/exclude/:deptId')
  @RequiresPermissions('system:dept:edit')
  async listExclude(@Param('deptId') deptId: number) {
    return await this.sysDeptService.listExclude(deptId);
  }

  /* 按部门统计用户数量（教师+学生） */
  @Get('userStatistics')
  @RequiresPermissions('system:dept:query')
  @ApiOperation({ summary: '按部门统计用户数量（教师+学生）' })
  async getUserStatistics() {
    return await this.sysDeptService.getUserStatisticsByDept();
  }

  /* 导出部门用户统计 */
  @RepeatSubmit()
  @Post('exportUserStatistics')
  @RequiresPermissions('system:dept:export')
  @Log({
    title: '部门用户统计',
    businessType: BusinessTypeEnum.export,
  })
  @Keep()
  @ApiOperation({ summary: '导出部门用户统计Excel' })
  async exportUserStatistics(): Promise<StreamableFile> {
    const data = await this.sysDeptService.getUserStatisticsByDept();
    const file = await this.excelService.export(ExportDeptUserStatisticsDto, data);
    return new StreamableFile(file);
  }

  /* 通过id查询 */
  @Get(':deptId')
  @RequiresPermissions('system:dept:query')
  async oneByDeptId(@Param('deptId') deptId: number) {
    const post = await this.sysDeptService.oneByDeptId(deptId);
    return DataObj.create(post);
  }

  /* 更新 */
  @Put()
  @RepeatSubmit()
  @RequiresPermissions('system:dept:edit')
  @Log({
    title: '部门管理',
    businessType: BusinessTypeEnum.update,
  })
  async uplate(@Body(UpdateMessagePipe) updateSysDeptDto: UpdateSysDeptDto) {
    await this.sysDeptService.update(updateSysDeptDto);
  }

  /* 删除 */
  @Delete(':deptIds')
  @RequiresPermissions('system:dept:remove')
  @Log({
    title: '部门管理',
    businessType: BusinessTypeEnum.delete,
  })
  async delete(@Param('deptIds') deptId: number) {
    await this.sysDeptService.delete(deptId);
  }
}
