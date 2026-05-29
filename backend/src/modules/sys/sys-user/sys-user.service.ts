/*
 * @Author: JiangSheng 87789771@qq.com
 * @Date: 2024-05-11 13:32:00
 * @LastEditors: JiangSheng 87789771@qq.com
 * @LastEditTime: 2024-06-27 11:17:14
 * @FilePath: \meimei-prisma-vue3\meimei-admin\src\modules\sys\sys-user\sys-user.service.ts
 * @Description:
 *
 */
import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService, PrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'src/shared/prisma/prisma.extension';
import {
  AddSysUserDto,
  CancelAllDto,
  ChangeStatusDto,
  GetSysUserListDto,
  ImportSysUserDto,
  ResetPwdDto,
  UpdataSelfDto,
  UpdateSelfPwd,
  UpdateSysUserDto,
} from './dto/req-sys-user.dto';
import { ApiException } from 'src/common/exceptions/api.exception';
import { SharedService } from 'src/shared/shared.service';
import * as bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { DataScope } from 'src/common/type/data-scope.type';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { USER_VERSION_KEY } from 'src/common/contants/redis.contant';
import { LoginService } from 'src/modules/login/login.service';

@Injectable()
export class SysUserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CustomPrisma')
    private readonly customPrisma: CustomPrismaService<ExtendedPrismaClient>,
    private readonly sharedService: SharedService,
    @InjectRedis() private readonly redis: Redis,
    private readonly loginService: LoginService,
  ) { }
  /* 分页查询 */
  async list(getSysUserListDto: GetSysUserListDto, dataScope: DataScope) {
    const { skip, take, status, userName, deptId, phonenumber, params, userType, majorGrade, studentNo } =
      getSysUserListDto;
    const contains = deptId ? `,${deptId},` : undefined;
    return await this.customPrisma.client.sysUser.findAndCount({
      include: {
        dept: true,
        appUser: true,
      },
      where: {
        AND: {
          delFlag: '0',
          status,
          userName: {
            contains: userName,
          },
          phonenumber: {
            contains: phonenumber,
          },
          createTime: {
            gte: params.beginTime,
            lt: params.endTime,
          },
          dept: {
            ancestors: {
              contains,
            },
          },
          appUser: {
            userType: userType || undefined,
            majorGrade: majorGrade ? { contains: majorGrade } : undefined,
            studentNo: studentNo ? { contains: studentNo } : undefined,
          },
          OR: dataScope.OR,
        },
      },
      skip,
      take,
    });
  }

  /* 查询岗位和角色列表 */
  async postAndRole() {
    return await Promise.all([
      this.prisma.sysPost.findMany({}),
      this.prisma.sysRole.findMany({
        where: {
          delFlag: '0',
        },
      }),
    ]);
  }

  /* 新增 */
  async add(addSysUserDto: AddSysUserDto) {
    const user = await this.prisma.sysUser.findFirst({
      where: {
        userName: addSysUserDto.userName,
      },
    });
    if (user) throw new ApiException('用户名称已存在，请更换后再试。');
    const params: AddSysUserDto = JSON.parse(JSON.stringify(addSysUserDto));
    // 加密密码
    const salt = await bcrypt.genSalt();
    params.password = await bcrypt.hash(params.password, salt);
    delete params.postIds;
    delete params.roleIds;
    return await this.prisma.sysUser.create({
      data: {
        ...params,
        posts: {
          connect: addSysUserDto.postIds.map((postId) => ({ postId })),
        },
        roles: {
          connect: addSysUserDto.roleIds.map((roleId) => ({ roleId })),
        },
      },
    });
  }

  /* 通过id查询 */
  async oneByUserId(userId: number) {
    return await this.prisma.sysUser.findUnique({
      include: {
        dept: {
          where: {
            delFlag: '0',
          },
        },
        posts: true,
        roles: {
          where: {
            delFlag: '0',
          },
        },
      },
      where: {
        userId,
        delFlag: '0',
      },
    });
  }

  /* 更新 */
  async update(updateSysUserDto: UpdateSysUserDto) {
    return await this.prisma.$transaction(async (prisma) => {
      const { userId } = updateSysUserDto;
      const user = await prisma.sysUser.findUnique({
        where: {
          userId,
        },
      });
      if (!user) throw new ApiException('该记录不存在，请重新查询后操作。');
      const params: AddSysUserDto = JSON.parse(
        JSON.stringify(updateSysUserDto),
      );
      delete params.postIds;
      delete params.roleIds;
      await prisma.sysUser.update({
        data: {
          ...params,
          posts: {
            set: updateSysUserDto.postIds.map((postId) => ({ postId })),
          },
          roles: {
            set: updateSysUserDto.roleIds.map((roleId) => ({ roleId })),
          },
        },
        where: {
          userId,
        },
      });
      return await this.addPv(userId);
    });
  }

  /* 删除用户 */
  async delete(userIdArr: number[]) {
    await this.prisma.sysUser.updateMany({
      data: {
        delFlag: '1',
      },
      where: {
        userId: {
          in: userIdArr,
        },
      },
    });
    const promiseArr = userIdArr.map((userId) => this.addPv(userId));
    await Promise.all(promiseArr);
  }

  /* 更新用户状态 */
  async changeStatus(changeStatusDto: ChangeStatusDto) {
    const { userId, userIds, status } = changeStatusDto;

    // 优先使用 userIds 批量更新，否则使用单个 userId
    const ids = userIds?.length ? userIds : (userId ? [userId] : []);

    if (ids.length === 0) {
      throw new ApiException('用户ID不能为空');
    }

    await this.prisma.sysUser.updateMany({
      where: {
        userId: { in: ids },
      },
      data: {
        status,
      },
    });

    // 刷新版本号
    for (const id of ids) {
      await this.addPv(id);
    }
  }

  /* 查询部门树 */
  async treeselect(dataScope: DataScope) {
    const deptList = await this.prisma.sysDept.findMany({
      select: {
        deptId: true,
        parentId: true,
        deptName: true,
      },
      where: {
        AND: {
          delFlag: '0',
          OR: dataScope.OR,
        },
      },
    });
    const newList = deptList.map((item) => ({
      id: item.deptId,
      parentId: item.parentId,
      label: item.deptName,
    }));
    const list = this.sharedService.handleTree(newList);
    return list;
  }

  /* 重置用户密码 */
  async resetPwd(resetPwdDto: ResetPwdDto) {
    const { userId, password } = resetPwdDto;
    const salt = await bcrypt.genSalt();
    const newPassword = await bcrypt.hash(password, salt);
    await this.prisma.sysUser.update({
      data: {
        password: newPassword,
      },
      where: {
        userId,
      },
    });
    return await this.addPv(userId);
  }

  /* 查询用户及  所有角色 */
  async authRole(userId: number) {
    const userProm = this.prisma.sysUser.findUnique({
      include: {
        roles: true,
      },
      where: {
        userId,
      },
    });
    const rolesProm = this.prisma.sysRole.findMany({
      select: {
        roleId: true,
        roleKey: true,
        roleName: true,
        createTime: true,
      },
      where: {
        delFlag: '0',
      },
    });
    const [user, roles] = await Promise.all([userProm, rolesProm]);
    const userRoles = user.roles;
    const newRoles = roles.map((item: any) => {
      item.flag = false;
      if (userRoles.find((item2) => item.roleId === item2.roleId)) {
        item.flag = true;
      }
      return item;
    });
    return {
      user,
      roles: newRoles,
    };
  }

  /* 批量取消或授权角色 */
  async cancelAll(cancelAllDto: CancelAllDto) {
    const { userId, roleIds } = cancelAllDto;
    await this.prisma.sysUser.update({
      where: {
        userId,
      },
      data: {
        roles: {
          set: roleIds.split(',').map((roleId) => ({ roleId: Number(roleId) })),
        },
      },
    });
    return await this.addPv(userId);
  }

  /* 导入用户列表 */
  async importData(importSysUserDtoArr: ImportSysUserDto[], isUpdate: boolean) {
    // 获取默认密码
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD || '123456';
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    return await this.prisma.$transaction(async (prisma) => {
      for (const item of importSysUserDtoArr) {
        // 根据院校名称查找部门ID
        const dept = await prisma.sysDept.findFirst({
          where: { deptName: item.institution, delFlag: '0' },
        });
        if (!dept) {
          throw new ApiException('院校：' + item.institution + ' 不存在，请先创建部门');
        }
        const deptId = dept.deptId;

        // 拼接 majorGrade: "专业-年级"
        const majorGrade = item.grade ? `${item.major}-${item.grade}` : item.major;

        // 生成用户账号：优先使用学号，如果没有学号则生成随机账号
        const userName = item.phone;
        if (!userName || userName == '') {
          throw new ApiException('用户手机号不能为空');
        }

        if (!isUpdate) {
          const user = await prisma.sysUser.findUnique({
            where: { userName },
          });
          if (user) {
            throw new ApiException('用户手机：' + userName + ' 已经注册，请更换后再试。');
          }

          // 创建 sysUser
          const sysUser = await prisma.sysUser.create({
            data: {
              userName,
              password: hashedPassword,
              nickName: item.nickName,
              deptId: Number(deptId),
              createTime: new Date(),
            },
          });

          // 创建 appUser
          await prisma.appUser.create({
            data: {
              userId: sysUser.userId,
              phone: item.phone,
              studentNo: item.studentNo,
              identity: item.identity,
              majorGrade,
              institution: deptId + '',
              realName: item.nickName,
              regStatus: '1',
              regApplyTime: sysUser.createTime,
            },
          });
        } else {
          const existingUser = await prisma.sysUser.findUnique({
            where: { userName },
          });
          // 更新 sysUser
          await prisma.sysUser.upsert({
            where: { userName },
            update: {
              nickName: item.nickName,
              deptId,
              realName: item.nickName,
            },
            create: {
              userName,
              password: hashedPassword,
              nickName: item.nickName,
              deptId,
              realName: item.nickName,
              createTime: new Date(),
            },
          });
          // 更新或创建 appUser
          if (existingUser) {
            await prisma.appUser.upsert({
              where: { userId: existingUser.userId },
              update: {
                phone: item.phone,
                studentNo: item.studentNo,
                identity: item.identity,
                majorGrade,
                institution: item.institution,
                realName: item.nickName,
              },
              create: {
                userId: existingUser.userId,
                phone: item.phone,
                studentNo: item.studentNo,
                identity: item.identity,
                majorGrade,
                institution: item.institution,
                realName: item.nickName,
                regStatus: '1',
                regApplyTime: existingUser.createTime,
              },
            });
          }
        }
      }
    });
  }

  /* 更新自己的信息 */
  async updataMyslf(updataSelfDto: UpdataSelfDto) {
    await this.prisma.sysUser.update({
      where: {
        userId: updataSelfDto.userId,
      },
      data: updataSelfDto,
    });
    return await this.loginService.getInfo(updataSelfDto.userId);
  }

  /* 更改个人密码 */
  async updatePwd(updateSelfPwd: UpdateSelfPwd) {
    const { userId, oldPassword, newPassword } = updateSelfPwd;
    return await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.sysUser.findUnique({
        where: {
          userId,
          delFlag: '0',
        },
      });
      if (!user) throw new ApiException('用户不存在');
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) throw new ApiException('旧密码错误');
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash(newPassword, salt);
      return await prisma.sysUser.update({
        where: {
          userId,
        },
        data: {
          password,
        },
      });
    });
  }

  /* 调整用户的缓存版本号，让用户重新登录 */
  async addPv(userId: number) {
    return await this.redis.incr(`${USER_VERSION_KEY}:${userId}`);
  }

  /* 更新用户头像 */
  async uploadAvatar(avatar: string, userId: number) {
    await this.prisma.sysUser.update({
      data: {
        avatar,
      },
      where: {
        userId,
      },
    });
    return await this.loginService.getInfo(userId);
  }
}
