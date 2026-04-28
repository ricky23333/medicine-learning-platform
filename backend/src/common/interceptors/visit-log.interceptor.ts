/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 访问日志拦截器 - 记录小程序端访问
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from 'nestjs-prisma';
import { Request } from 'express';

@Injectable()
export class VisitLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path;

    // 只记录 /app/ 路径下的请求
    if (!path.startsWith('/app/')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: async () => {
          await this.recordVisit(request);
        },
        error: async () => {
          await this.recordVisit(request);
        },
      }),
    );
  }

  /* 记录访问日志 */
  private async recordVisit(request: Request) {
    try {
      const user = (request as any).user;
      const userId = user?.userId;
      const ip = this.getClientIp(request);
      const path = request.path;

      await this.prisma.appVisitLog.create({
        data: {
          userId: userId || null,
          ip: ip || null,
          path,
          visitTime: new Date(),
        },
      });
    } catch (error) {
      console.error('访问日志记录失败:', error);
    }
  }

  /* 获取客户端IP */
  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return (forwarded as string).split(',')[0].trim();
    }
    return request.ip || request.socket?.remoteAddress || '';
  }
}