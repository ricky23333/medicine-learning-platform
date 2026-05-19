/*
  Warnings:

  - You are about to alter the column `createTime` on the `sys_config` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_config` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_dept` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_dept` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_dict_data` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_dict_data` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_dict_type` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_dict_type` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_job` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_job` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_job_log` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `loginTime` on the `sys_login_infor` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_menu` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_menu` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_notice` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_notice` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `operTime` on the `sys_oper_log` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_post` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_post` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_role` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_role` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_table` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_table` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_user` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `loginDate` on the `sys_user` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_user` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createTime` on the `sys_web` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updateTime` on the `sys_web` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.

*/
-- AlterTable
ALTER TABLE `museum` ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `sys_config` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_dept` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_dict_data` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_dict_type` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_job` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_job_log` MODIFY `createTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_login_infor` MODIFY `loginTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_menu` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_notice` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_oper_log` MODIFY `operTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_post` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_role` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_table` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_user` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `loginDate` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `sys_web` MODIFY `createTime` DATETIME(0) NULL,
    MODIFY `updateTime` DATETIME(0) NULL;

-- CreateTable
CREATE TABLE `app_feedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `userType` VARCHAR(20) NULL,
    `content` TEXT NOT NULL,
    `contact` VARCHAR(100) NULL,
    `images` TEXT NULL,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `remark` VARCHAR(500) NULL,
    `handleBy` VARCHAR(64) NULL,
    `handleTime` DATETIME(3) NULL,
    `createBy` VARCHAR(64) NOT NULL DEFAULT '',
    `createTime` DATETIME(0) NULL,
    `updateBy` VARCHAR(64) NULL DEFAULT '',
    `updateTime` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
