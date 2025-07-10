/*
  Warnings:

  - A unique constraint covering the columns `[id,userId]` on the table `Recording` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Recording_id_userId_key` ON `Recording`(`id`, `userId`);
