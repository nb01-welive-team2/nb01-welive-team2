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
      displayName: "residents-api",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["**/integrationTest/**/residents*.test.ts"],
    },
    {
      displayName: "residents-unit",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["**/unitTest/**/residents*.unit.test.ts"],
      displayName: "notice-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/noticeTest/notice*.test.ts"],
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
