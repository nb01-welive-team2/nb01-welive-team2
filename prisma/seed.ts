import { PrismaClient } from "@prisma/client";
import {
  mockUsers,
  mockApartmentInfo,
  mockUserInfo,
  mockResidents,
  mockComplaints,
  mockPolls,
  mockPollOptions,
  mockVotes,
  mockNotices,
  mockNotifications,
} from "./mock";

const prisma = new PrismaClient();

export async function seedDatabase(): Promise<void> {
  // 삭제 순서 (의존성 있는 것부터 제거)
  await prisma.$executeRawUnsafe(`DELETE FROM "Notifications"`);
  await prisma.votes.deleteMany();
  await prisma.pollOptions.deleteMany();
  await prisma.polls.deleteMany();
  await prisma.notices.deleteMany();
  await prisma.complaints.deleteMany();
  await prisma.userInfo.deleteMany();
  await prisma.residents.deleteMany();
  await prisma.users.deleteMany();
  await prisma.apartmentInfo.deleteMany();

  // 생성 순서 (참조되는 것부터 생성)
  await prisma.users.createMany({
    data: mockUsers,
    skipDuplicates: false,
  });

  await prisma.apartmentInfo.createMany({
    data: mockApartmentInfo,
    skipDuplicates: false,
  });

  await prisma.userInfo.createMany({
    data: mockUserInfo,
    skipDuplicates: false,
  });

  await prisma.residents.createMany({
    data: mockResidents,
    skipDuplicates: false,
  });

  await prisma.complaints.createMany({
    data: mockComplaints,
    skipDuplicates: false,
  });

  await prisma.notices.createMany({
    data: mockNotices,
    skipDuplicates: false,
  });

  await prisma.polls.createMany({
    data: mockPolls,
    skipDuplicates: false,
  });

  await prisma.pollOptions.createMany({
    data: mockPollOptions,
    skipDuplicates: false,
  });

  await prisma.votes.createMany({
    data: mockVotes,
    skipDuplicates: false,
  });

  // Notifications 관계 검증
  const userIds = mockUsers.map((u) => u.id);
  const complaintIds = mockComplaints.map((c) => c.id);
  const noticeIds = mockNotices.map((n) => n.id);
  const pollIds = mockPolls.map((p) => p.id);

  for (const noti of mockNotifications) {
    if (!userIds.includes(noti.userId)) {
      console.warn(`userId ${noti.userId} not found in mockUsers`);
    }
    if (noti.complaintId && !complaintIds.includes(noti.complaintId)) {
      console.warn(
        `complaintId ${noti.complaintId} not found in mockComplaints`
      );
    }
    if (noti.noticeId && !noticeIds.includes(noti.noticeId)) {
      console.warn(`noticeId ${noti.noticeId} not found in mockNotices`);
    }
    if (noti.pollId && !pollIds.includes(noti.pollId)) {
      console.warn(`pollId ${noti.pollId} not found in mockPolls`);
    }
  }

  // Notifications raw SQL 삽입
  for (const noti of mockNotifications) {
    const notifiedAt = new Date(noti.notifiedAt).toISOString();

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Notifications" (
        "id", "userId", "content", "notificationType",
        "notifiedAt", "isChecked", "complaintId",
        "noticeId", "pollId"
      ) VALUES (
        '${noti.id}', '${noti.userId}', '${noti.content}', '${noti.notificationType}',
        '${notifiedAt}', ${noti.isChecked},
        ${noti.complaintId ? `'${noti.complaintId}'` : "NULL"},
        ${noti.noticeId ? `'${noti.noticeId}'` : "NULL"},
        ${noti.pollId ? `'${noti.pollId}'` : "NULL"}
      )
    `);
  }
}

// CLI 실행 시 동작
if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error("Seed failed", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
