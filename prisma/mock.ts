import {
  USER_ROLE,
  JOIN_STATUS,
  APPROVAL_STATUS,
  RESIDENCE_STATUS,
  HOUSEHOLDER_STATUS,
  BOARD_ID,
  POLL_STATUS,
  NOTICE_CATEGORY,
  NOTIFICATION_TYPE,
} from "@prisma/client";

interface Users {
  id: string;
  username: string;
  encryptedPassword: string;
  contact: string;
  name: string;
  email: string;
  role: USER_ROLE;
  joinStatus: JOIN_STATUS;
  profileImage?: string | null;
}

interface ApartmentInfo {
  id: string;
  userId: string;
  approvalStatus: APPROVAL_STATUS;
  apartmentName: string;
  apartmentAddress: string;
  apartmentManagementNumber: string;
  description?: string | null;
  startComplexNumber?: number | null;
  endComplexNumber?: number | null;
  startDongNumber: number;
  endDongNumber: number;
  startFloorNumber: number;
  endFloorNumber: number;
  startHoNumber: number;
  endHoNumber: number;
  createdAt: Date;
}

interface UserInfo {
  id: string;
  userId: string;
  apartmentId: string;
  apartmentName: string;
  apartmentDong: number;
  apartmentHo: number;
}

interface Residents {
  id: string;
  apartmentId: string;
  building: number;
  unitNumber: number;
  contact: string;
  name: string;
  email: string;
  residenceStatus: RESIDENCE_STATUS;
  isHouseholder: HOUSEHOLDER_STATUS;
  isRegistered: boolean;
  approvalStatus: APPROVAL_STATUS;
}

interface Complaints {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  isPublic: boolean;
  approvalStatus: APPROVAL_STATUS;
}

interface Polls {
  id: string;
  userId: string;
  title: string;
  content: string;
  startDate: Date;
  endDate: Date;
  status: POLL_STATUS;
  buildingPermission: number;
}

interface PollOptions {
  id: string;
  pollId: string;
  title: string;
}

interface Votes {
  optionId: string;
  userId: string;
}

interface Notices {
  id: string;
  userId: string;
  title: string;
  content: string;
  startDate: Date;
  endDate: Date;
  isPinned: boolean;
  category: NOTICE_CATEGORY;
  viewCount: number;
}

interface Notifications {
  id: string;
  userId: string;
  content: string;
  notificationType: NOTIFICATION_TYPE;
  notifiedAt: Date;
  isChecked: boolean;
  complaintId?: string | null;
  noticeId?: string | null;
  pollId?: string | null;
}

const mockUsers: Users[] = [
  {
    id: "18c35b60-b56c-470d-8713-73446c585859",
    username: "alice123",
    encryptedPassword:
      "$2a$10$G68FzGayQhBUnQw05b.bQuhr0tQMaACu1iXTTBCRHSxRNzGVUuRRO", //bycrypt round 10회 alicepassword
    contact: "01012345678",
    name: "Alice Wonderland",
    email: "alice@example.com",
    role: USER_ROLE.USER,
    joinStatus: JOIN_STATUS.APPROVED,
    profileImage: null,
  },
  {
    id: "0f9e7654-dfbb-46df-b93c-cc491ff9f5bd",
    username: "bob456",
    encryptedPassword:
      "$2a$10$pJffFvTAHtCQzjOh4YRKF.qwIqSCCcPLLawMhjJSwaHWxtUytjqwa", //bycrypt round 10회 bobpassword
    contact: "01087654321",
    name: "Bob Builder",
    email: "bob@example.com",
    role: USER_ROLE.ADMIN,
    joinStatus: JOIN_STATUS.APPROVED,
    profileImage: "https://example.com/bob.jpg",
  },
];

const mockApartmentInfo: ApartmentInfo[] = [
  {
    id: "2149430f-2892-463f-b3e7-4e893548c6d6",
    userId: "18c35b60-b56c-470d-8713-73446c585859",
    approvalStatus: APPROVAL_STATUS.APPROVED,
    apartmentName: "Sunshine Apartments",
    apartmentAddress: "123 Sunshine St, Seoul",
    apartmentManagementNumber: "MNG-001",
    description: "A nice apartment complex.",
    startComplexNumber: 1,
    endComplexNumber: 5,
    startDongNumber: 101,
    endDongNumber: 105,
    startFloorNumber: 1,
    endFloorNumber: 10,
    startHoNumber: 101,
    endHoNumber: 120,
    createdAt: new Date("2024-01-01T09:00:00Z"),
  },
];

const mockUserInfo: UserInfo[] = [
  {
    id: "8b24ca33-d90c-442c-8bbc-eb0e12c4c846",
    userId: "18c35b60-b56c-470d-8713-73446c585859",
    apartmentId: "2149430f-2892-463f-b3e7-4e893548c6d6",
    apartmentName: "Sunshine Apartments",
    apartmentDong: 101,
    apartmentHo: 110,
  },
];

const mockResidents: Residents[] = [
  {
    id: "69f298ce-5775-4206-b377-d083313e4946",
    apartmentId: "2149430f-2892-463f-b3e7-4e893548c6d6",
    building: 1,
    unitNumber: 110,
    contact: "010-9999-9999",
    name: "Charlie Chaplin",
    email: "charlie@example.com",
    residenceStatus: RESIDENCE_STATUS.RESIDENCE,
    isHouseholder: HOUSEHOLDER_STATUS.HOUSEHOLDER,
    isRegistered: true,
    approvalStatus: APPROVAL_STATUS.APPROVED,
  },
];

const mockComplaints: Complaints[] = [
  {
    id: "693cd12f-d156-4e07-9934-ad02a4fce664",
    userId: "0f9e7654-dfbb-46df-b93c-cc491ff9f5bd",
    title: "Noisy neighbors",
    content: "There is too much noise after 10 PM.",
    createdAt: new Date("2024-04-01T12:00:00Z"),
    isPublic: true,
    approvalStatus: APPROVAL_STATUS.PENDING,
  },
];

const mockPolls: Polls[] = [
  {
    id: "8b83f903-5ede-476d-86a4-a4e20f9c99ac",
    userId: "0f9e7654-dfbb-46df-b93c-cc491ff9f5bd",
    title: "Vote on new playground",
    content: "Please vote for the playground location.",
    startDate: new Date("2024-04-20T00:00:00Z"),
    endDate: new Date("2024-04-30T00:00:00Z"),
    status: POLL_STATUS.IN_PROGRESS,
    buildingPermission: 1,
  },
];

const mockPollOptions: PollOptions[] = [
  {
    id: "33ec83f9-fd3c-4596-9825-65774f4b06fe",
    pollId: "8b83f903-5ede-476d-86a4-a4e20f9c99ac",
    title: "Playground near building A",
  },
  {
    id: "4a7f589e-cfae-42f6-a63f-ab68d719f446",
    pollId: "8b83f903-5ede-476d-86a4-a4e20f9c99ac",
    title: "Playground near building B",
  },
];

const mockVotes: Votes[] = [
  {
    optionId: "33ec83f9-fd3c-4596-9825-65774f4b06fe",
    userId: "18c35b60-b56c-470d-8713-73446c585859",
  },
];

const mockNotices: Notices[] = [
  {
    id: "f1c531ea-8f03-4f12-a8bb-7899148354df",
    userId: "18c35b60-b56c-470d-8713-73446c585859",
    title: "Community Meeting",
    content: "Next community meeting is on May 1st.",
    startDate: new Date("2024-04-25T00:00:00Z"),
    endDate: new Date("2024-05-01T00:00:00Z"),
    isPinned: true,
    category: NOTICE_CATEGORY.COMMUNITY,
    viewCount: 50,
  },
];

const mockNotifications: Notifications[] = [
  {
    id: "58d3088a-ff7d-4987-8966-2d97867107ab",
    userId: "18c35b60-b56c-470d-8713-73446c585859",
    content: "Your complaint has been resolved.",
    notificationType: NOTIFICATION_TYPE.COMPLAINT_RESOLVED,
    notifiedAt: new Date("2024-04-10T10:00:00Z"),
    isChecked: false,
    complaintId: "693cd12f-d156-4e07-9934-ad02a4fce664",
    noticeId: null,
    pollId: null,
  },
  {
    id: "6f9a6b75-1422-42b4-a56c-f62fce55974c",
    userId: "0f9e7654-dfbb-46df-b93c-cc491ff9f5bd",
    content: "New community notice posted.",
    notificationType: NOTIFICATION_TYPE.공지_등록,
    notifiedAt: new Date("2024-04-05T08:00:00Z"),
    isChecked: true,
    complaintId: null,
    noticeId: "f1c531ea-8f03-4f12-a8bb-7899148354df",
    pollId: null,
  },
];

export {
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
};
