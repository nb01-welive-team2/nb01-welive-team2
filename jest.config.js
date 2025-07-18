const commonConfig = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = {
  projects: [
    {
      displayName: "poll-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/pollTest/poll*.test.ts"],
    },
    {
      displayName: "poll-integration",
      ...commonConfig,
      testMatch: ["**/integrationTest/**/poll*.test.ts"],
    },
    {
      displayName: "residents-api",
      ...commonConfig,
      testMatch: ["**/integrationTest/**/residents*.test.ts"],
    },
    {
      displayName: "residents-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/**/residents*.unit.test.ts"],
    },
    {
      displayName: "notice-integration",
      ...commonConfig,
      testMatch: ["**/integrationTest/notice*.test.ts"],
    },
    {
      displayName: "complaint-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/complaintTest/complaint*.test.ts"],
    },
    {
      displayName: "complaint-integration",
      ...commonConfig,
      testMatch: ["**/integrationTest/complaint*.test.ts"],
    },
    {
      displayName: "event-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/eventTest/event*.test.ts"],
    },
    {
      displayName: "event-integration",
      ...commonConfig,
      testMatch: ["**/integrationTest/event*.test.ts"],
    },
    {
      displayName: "auth-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/authTest/auth*.test.ts"],
    },
    {
      displayName: "user-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/userTest/user*.test.ts"],
    },
    {
      displayName: "userAuth-integration",
      ...commonConfig,
      testMatch: ["**/integrationTest/user*.test.ts"],
    },
    {
      displayName: "image-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/imageTest/image*.test.ts"],
    },
    {
      displayName: "image-integration",
      ...commonConfig,
      testMatch: ["**/integrationTest/image*.test.ts"],
    },
    {
      displayName: "notification-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/notificationTest/notification*.test.ts"],
    },
    {
      displayName: "notification-integration",
      ...commonConfig,
      testMatch: ["**/integrationTest/notification*.test.ts"],
    },
    {
      displayName: "apartmentInfo-api",
      ...commonConfig,
      testMatch: ["**/integrationTest/apartmentInfo*.test.ts"],
    },
    {
      displayName: "apartmentInfo-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/**/apartmentInfo*.unit.test.ts"],
    },
    {
      displayName: "notice-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/noticeTest/notice*.test.ts"],
    },
  ],
};
