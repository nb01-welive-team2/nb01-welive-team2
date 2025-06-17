/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Notices` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Articles" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Notices" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
