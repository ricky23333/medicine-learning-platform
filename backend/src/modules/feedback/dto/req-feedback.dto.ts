/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 反馈建议 DTO
 */
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { DataBaseDto } from 'src/common/dto/data-base.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/* 小程序端提交反馈 */
export class AddAppFeedbackDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  images?: string; // JSON array string
}

/* 管理员查询反馈列表 */
export class GetAppFeedbackListDto extends PaginationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  nickname?: string;
}

/* 管理员处理反馈 */
export class UpdateAppFeedbackDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}