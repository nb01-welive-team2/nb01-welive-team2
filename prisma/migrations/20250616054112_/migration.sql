-- CreateEnum
CREATE TYPE "USER_ROLE" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "JOIN_STATUS" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- CreateEnum
CREATE TYPE "APPROVAL_STATUS" AS ENUM ('UNRECEIVED', 'PENDING', 'APPROVED');

-- CreateEnum
CREATE TYPE "RESIDENCE_STATUS" AS ENUM ('RESIDENCE', 'NO_RESIDENCE');

-- CreateEnum
CREATE TYPE "HOUSEHOLDER_STATUS" AS ENUM ('HOUSEHOLDER', 'MEMBER');

-- CreateEnum
CREATE TYPE "BOARD_ID" AS ENUM ('NOTICE', 'POLL');

-- CreateEnum
CREATE TYPE "POLL_STATUS" AS ENUM ('PENDING', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "NOTICE_CATEGORY" AS ENUM ('MAINTENANCE', 'EMERGENCY', 'COMMUNITY', 'RESIDENT_VOTE', 'ETC');

-- CreateEnum
CREATE TYPE "NOTIFICATION_TYPE" AS ENUM ('COMPLAINT_RESOLVED', '민원_등록', '공지_등록', '회원가입신청');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "encryptedPassword" VARCHAR(100) NOT NULL,
    "contact" VARCHAR(20) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "role" "USER_ROLE" NOT NULL,
    "joinStatus" "JOIN_STATUS" NOT NULL,
    "profileImage" VARCHAR(255),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApartmentInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "approvalStatus" "APPROVAL_STATUS" NOT NULL,
    "apartmentName" VARCHAR(100) NOT NULL,
    "apartmentAddress" VARCHAR(255) NOT NULL,
    "apartmentManagementNumber" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "startComplexNumber" INTEGER,
    "endComplexNumber" INTEGER,
    "startDongNumber" INTEGER NOT NULL,
    "endDongNumber" INTEGER NOT NULL,
    "startFloorNumber" INTEGER NOT NULL,
    "endFloorNumber" INTEGER NOT NULL,
    "startHoNumber" INTEGER NOT NULL,
    "endHoNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApartmentInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "apartmentName" VARCHAR(100) NOT NULL,
    "apartmentDong" INTEGER NOT NULL,
    "apartmentHo" INTEGER NOT NULL,

    CONSTRAINT "UserInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Residents" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "building" INTEGER NOT NULL,
    "unitNumber" INTEGER NOT NULL,
    "contact" VARCHAR(20) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "residenceStatus" "RESIDENCE_STATUS" NOT NULL,
    "isHouseholder" "HOUSEHOLDER_STATUS" NOT NULL,
    "isRegistered" BOOLEAN NOT NULL,
    "approvalStatus" "APPROVAL_STATUS" NOT NULL,

    CONSTRAINT "Residents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaints" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublic" BOOLEAN NOT NULL,
    "approvalStatus" "APPROVAL_STATUS" NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Articles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "boardId" "BOARD_ID" NOT NULL,

    CONSTRAINT "Articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Polls" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "status" "POLL_STATUS" NOT NULL,
    "buildingPermission" INTEGER NOT NULL,

    CONSTRAINT "Polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollOptions" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "content" VARCHAR(100) NOT NULL,

    CONSTRAINT "PollOptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Votes" (
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("optionId","userId")
);

-- CreateTable
CREATE TABLE "Notices" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL,
    "category" "NOTICE_CATEGORY" NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "notificationType" "NOTIFICATION_TYPE" NOT NULL,
    "notifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "complaintId" TEXT,
    "noticeId" TEXT,
    "pollId" TEXT,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_contact_key" ON "Users"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Residents_email_key" ON "Residents"("email");

-- AddForeignKey
ALTER TABLE "ApartmentInfo" ADD CONSTRAINT "ApartmentInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "ApartmentInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Residents" ADD CONSTRAINT "Residents_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "ApartmentInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaints" ADD CONSTRAINT "Complaints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Articles" ADD CONSTRAINT "Articles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Polls" ADD CONSTRAINT "Polls_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOptions" ADD CONSTRAINT "PollOptions_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notices" ADD CONSTRAINT "Notices_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
