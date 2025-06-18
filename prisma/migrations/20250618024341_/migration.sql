/*
  Warnings:

  - You are about to drop the column `articleId` on the `Notices` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `Polls` table. All the data in the column will be lost.
  - You are about to drop the `Articles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Notices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Notices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Polls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Polls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Polls` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Articles" DROP CONSTRAINT "Articles_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notices" DROP CONSTRAINT "Notices_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Polls" DROP CONSTRAINT "Polls_articleId_fkey";

-- AlterTable
ALTER TABLE "Notices" DROP COLUMN "articleId",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "title" VARCHAR(100) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Polls" DROP COLUMN "articleId",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "title" VARCHAR(100) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Articles";

-- AddForeignKey
ALTER TABLE "Polls" ADD CONSTRAINT "Polls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notices" ADD CONSTRAINT "Notices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
