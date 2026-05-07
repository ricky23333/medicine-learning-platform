import { AppUser, SysDept, SysPost, SysRole, SysUser } from '@prisma/client';
import { DataScope } from './data-scope.type';

export type UserInfo = SysUser & {
  dept?: SysDept;
  roles: SysRole[];
  posts: SysPost[];
  appUser?: AppUser | null;
  permissions: string[];
  dataScope: DataScope;
};
