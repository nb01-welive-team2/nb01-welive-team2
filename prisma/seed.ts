import { PrismaClient } from "@prisma/client";
import {
  mockUsers,
  mockApartmentInfo,
  mockUserInfo,
  mockResidents,
  mockComplaints,
  mockArticles,
  mockPolls,
  mockPollOptions,
  mockVotes,
  mockNotices,
  mockNotifications,
} from "./mock";

const prisma = new PrismaClient();

export async function seedDatabase(): Promise<void> {
  // 삭제 순서: 의존성 관계 고려 (참조하는 쪽이 먼저 삭제)
  await prisma.notifications.deleteMany();
  await prisma.votes.deleteMany();
  await prisma.pollOptions.deleteMany();
  await prisma.polls.deleteMany();
  await prisma.notices.deleteMany();
  await prisma.articles.deleteMany();
  await prisma.complaints.deleteMany();
  await prisma.userInfo.deleteMany();
  await prisma.residents.deleteMany();
  await prisma.apartmentInfo.deleteMany();
  await prisma.users.deleteMany();

  // 생성 순서: 참조 받는 쪽이 먼저 생성
  await prisma.users.createMany({ data: mockUsers, skipDuplicates: false });
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
  await prisma.articles.createMany({
    data: mockArticles,
    skipDuplicates: false,
  });
  await prisma.polls.createMany({ data: mockPolls, skipDuplicates: false });
  await prisma.pollOptions.createMany({
    data: mockPollOptions,
    skipDuplicates: false,
  });
  await prisma.votes.createMany({ data: mockVotes, skipDuplicates: false });
  await prisma.notices.createMany({ data: mockNotices, skipDuplicates: false });
  await prisma.notifications.createMany({
    data: mockNotifications,
    skipDuplicates: false,
  });
}

// 직접 실행할 때만 작동
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("🌱 Seed completed successfully");
    })
    .catch((e) => {
      console.error("❌ Seed failed", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
