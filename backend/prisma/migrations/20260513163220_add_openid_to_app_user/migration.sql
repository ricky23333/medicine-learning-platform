/*
  Warnings:

  - A unique constraint covering the columns `[openid]` on the table `app_user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `app_user` ADD COLUMN `openid` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `app_user_openid_key` ON `app_user`(`openid`);
