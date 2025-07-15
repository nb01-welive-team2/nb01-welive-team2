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
      displayName: "notice-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/noticeTest/notice*.test.ts"],
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
      displayName: "auth-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/authTest/auth*.test.ts"],
    },
    {
      displayName: "auth-api",
      ...commonConfig,
      testMatch: ["**/integrationTest/auth*.test.ts"],
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
      displayName: "event-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/eventTest/event*.test.ts"],
    },
    {
      displayName: "event-integration",
      ...commonConfig,
      testMatch: ["**/eventTest/event*.test.ts"],
    },
  ],
};
