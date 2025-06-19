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
      testMatch: ["**/unit/**/poll*.test.ts"],
    },
    {
      displayName: "poll-api",
      ...commonConfig,
      testMatch: ["**/integration/**/poll*.test.ts"],
    },
    {
      displayName: "notice-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/noticeTest/notice*.test.ts"],
    },
    {
      displayName: "complaint-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/complaintTest/complaint*.test.ts"],
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
  ],
};
