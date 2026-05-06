/*
 * @Author: rickyluo
 * @Date: 2024-04-26
 * @Description: 小程序用户服务
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ApiException } from 'src/common/exceptions/api.exception';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AppUserService {
  constructor(private readonly prisma: PrismaService) {}

  /* 用户注册申请 */
  async register(registerDto: any) {
    const { phone, userType, realName, institution, majorGrade, studentNo, contact } = registerDto;

    // 检查手机号是否已注册
    const existingUser = await this.prisma.sysUser.findFirst({
      where: { userName: phone },
    });
    if (existingUser) {
      throw new ApiException('该手机号已注册');
    }

    // 创建 SysUser (默认密码 888888)
    const salt = await bcrypt.genSalt();
    const defaultPassword = await bcrypt.hash('888888', salt);

    const user = await this.prisma.sysUser.create({
      data: {
        userName: phone,
        nickName: realName,
        password: defaultPassword,
        phonenumber: phone,
        status: '0',
        delFlag: '0',
      },
    });

    // 创建 AppUser 扩展信息
    await this.prisma.appUser.create({
      data: {
        userId: user.userId,
        userType: userType || 'student',
        realName,
        phone,
        institution,
        majorGrade: userType === 'student' ? majorGrade : null,
        studentNo: userType === 'student' ? studentNo : null,
        contact: userType === 'teacher' ? contact : null,
        regStatus: '0', // 待审核
        regApplyTime: new Date(),
      },
    });

    return { message: '注册申请已提交，请等待管理员审核' };
  }

  /* 申请VIP */
  async applyVip(userId: number) {
    const appUser = await this.prisma.appUser.findUnique({
      where: { userId },
    });
    if (!appUser) {
      throw new ApiException('用户信息不存在');
    }
    if (appUser.userType !== 'teacher') {
      throw new ApiException('只有教师才能申请VIP');
    }
    if (appUser.vipStatus === '1') {
      throw new ApiException('VIP申请正在审核中');
    }
    if (appUser.vipStatus === '2') {
      throw new ApiException('您已经是VIP用户');
    }

    await this.prisma.appUser.update({
      where: { userId },
      data: {
        vipStatus: '1',
        vipApplyTime: new Date(),
      },
    });

    return { message: 'VIP申请已提交，请等待管理员审核' };
  }

  /* 获取用户信息 */
  async getInfo(userId: number) {
    const appUser = await this.prisma.appUser.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            nickName: true,
            avatar: true,
            email: true,
            phonenumber: true,
          },
        },
      },
    });
    if (!appUser) {
      throw new ApiException('用户信息不存在');
    }
    return appUser;
  }

  /* 更新用户信息 */
  async updateProfile(userId: number, updateDto: any) {
    const { realName, institution, majorGrade, studentNo, contact } = updateDto;

    await this.prisma.appUser.update({
      where: { userId },
      data: {
        realName,
        institution,
        majorGrade,
        studentNo,
        contact,
      },
    });
  }

  /* 获取待审核注册列表 */
  async getRegisterAuditList(query: any) {
    const { skip = 0, take = 10, regStatus } = query;
    const where: any = {};
    if (regStatus) {
      where.regStatus = regStatus;
    } else {
      where.regStatus = '0';
    }

    const [rows, total] = await Promise.all([
      this.prisma.appUser.findMany({
        where,
        skip,
        take,
        orderBy: { createTime: 'desc' },
        include: {
          user: {
            select: {
              userId: true,
              userName: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.appUser.count({ where }),
    ]);
    return { rows, total };
  }

  /* 审核注册 - 通过 */
  async approveRegister(userId: number, approveBy: string) {
    await this.prisma.appUser.update({
      where: { userId },
      data: {
        regStatus: '1',
        regApproveTime: new Date(),
        regApproveBy: approveBy,
      },
    });
    await this.prisma.sysUser.update({
      where: { userId },
      data: { status: '0' },
    });
  }

  /* 审核注册 - 拒绝 */
  async rejectRegister(userId: number, approveBy: string) {
    await this.prisma.appUser.update({
      where: { userId },
      data: {
        regStatus: '2',
        regApproveTime: new Date(),
        regApproveBy: approveBy,
      },
    });
    // 可选：删除用户或标记为禁用
  }

  /* 获取VIP申请列表 */
  async getVipAuditList(query: any) {
    const { skip = 0, take = 10, vipStatus } = query;
    const where: any = {
      userType: 'teacher',
    };
    if (vipStatus) {
      where.vipStatus = vipStatus;
    } else {
      where.vipStatus = '1';
    }

    const [rows, total] = await Promise.all([
      this.prisma.appUser.findMany({
        where,
        skip,
        take,
        orderBy: { vipApplyTime: 'desc' },
        include: {
          user: {
            select: {
              userId: true,
              userName: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.appUser.count({ where }),
    ]);
    return { rows, total };
  }

  /* 审核VIP - 通过 */
  async approveVip(userId: number, approveBy: string) {
    await this.prisma.appUser.update({
      where: { userId },
      data: {
        vipStatus: '2',
        vipApproveTime: new Date(),
        vipApproveBy: approveBy,
      },
    });
  }

  /* 审核VIP - 拒绝 */
  async rejectVip(userId: number, approveBy: string) {
    await this.prisma.appUser.update({
      where: { userId },
      data: {
        vipStatus: '3',
        vipApproveTime: new Date(),
        vipApproveBy: approveBy,
      },
    });
  }

  /* 获取用户列表（管理员） */
  async getUserList(query: any) {
    const { skip = 0, take = 10, userType, vipStatus, institution } = query;
    const where: any = {};
    if (userType) where.userType = userType;
    if (vipStatus) where.vipStatus = vipStatus;
    if (institution) where.institution = { contains: institution };

    const [rows, total] = await Promise.all([
      this.prisma.appUser.findMany({
        where,
        skip,
        take,
        orderBy: { createTime: 'desc' },
        include: {
          user: {
            select: {
              userId: true,
              userName: true,
              status: true,
              createTime: true,
            },
          },
        },
      }),
      this.prisma.appUser.count({ where }),
    ]);
    return { rows, total };
  }

  /* 批量导入用户 */
  async batchImport(importUsers: any[], isUpdateSupport: boolean) {
    const results = { success: 0, fail: 0, errors: [] as string[] };

    for (const item of importUsers) {
      try {
        const hashedPassword = bcrypt.hashSync(
          item.password || '888888',
          bcrypt.genSaltSync(),
        );

        // 检查用户是否已存在
        const existing = await this.prisma.sysUser.findFirst({
          where: { userName: item.userName },
        });

        if (existing) {
          if (!isUpdateSupport) {
            results.fail++;
            results.errors.push(`手机号 ${item.userName} 已存在，跳过`);
            continue;
          }
          // 更新已存在用户
          await this.prisma.sysUser.update({
            where: { userName: item.userName },
            data: {
              nickName: item.realName,
              password: hashedPassword,
              phonenumber: item.userName,
              status: '0',
            },
          });

          await this.prisma.appUser.update({
            where: { userId: existing.userId },
            data: {
              userType: item.userType,
              realName: item.realName,
              phone: item.userName,
              institution: item.institution,
              majorGrade: item.userType === 'student' ? item.majorGrade : null,
              studentNo: item.userType === 'student' ? item.studentNo : null,
              contact: item.userType === 'teacher' ? item.contact : null,
            },
          });
        } else {
          // 创建新用户
          const user = await this.prisma.sysUser.create({
            data: {
              userName: item.userName,
              nickName: item.realName,
              password: hashedPassword,
              phonenumber: item.userName,
              status: '0',
              delFlag: '0',
            },
          });

          await this.prisma.appUser.create({
            data: {
              userId: user.userId,
              userType: item.userType,
              realName: item.realName,
              phone: item.userName,
              institution: item.institution,
              majorGrade: item.userType === 'student' ? item.majorGrade : null,
              studentNo: item.userType === 'student' ? item.studentNo : null,
              contact: item.userType === 'teacher' ? item.contact : null,
              regStatus: '0',
              regApplyTime: new Date(),
            },
          });
        }
        results.success++;
      } catch (error) {
        results.fail++;
        results.errors.push(`手机号 ${item.userName} 失败: ${error.message}`);
      }
    }

    return results;
  }

  /* 获取所有高校统计 */
  async getUniversityStats() {
    const stats = await this.prisma.appUser.groupBy({
      by: ['institution'],
      where: {
        institution: { not: '' },
      },
      _count: { userId: true },
    });

    return stats.map((s) => ({
      institution: s.institution,
      userCount: s._count.userId,
    }));
  }

  /* 获取特定高校的详细统计 */
  async getUniversityDetailStats(institution: string) {
    // 查询该学校的所有用户
    const users = await this.prisma.appUser.findMany({
      where: { institution },
      select: { majorGrade: true, userType: true },
    });

    const totalUsers = users.length;

    // 按专业年级分组统计（仅学生）
    const gradeDistributionMap = new Map<string, number>();
    let studentCount = 0;

    users.forEach((u) => {
      if (u.userType === 'student') {
        studentCount++;
        const grade = u.majorGrade || '未填写';
        gradeDistributionMap.set(grade, (gradeDistributionMap.get(grade) || 0) + 1);
      }
    });

    const majorCount = new Set(users.map((u) => u.majorGrade).filter(Boolean)).size;

    const gradeDistribution = Array.from(gradeDistributionMap.entries()).map(
      ([majorGrade, studentCount]) => ({ majorGrade, studentCount }),
    );

    return { totalUsers, majorCount, studentCount, gradeDistribution };
  }
}