/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 统计 DTO
 */
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

/* 学校统计查询 */
export class GetSchoolStatsDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  deptId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  majorGrade?: string;
}

/* 导出学生成绩查询 */
export class ExportStudentScoresDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  deptId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  majorGrade?: string;
}