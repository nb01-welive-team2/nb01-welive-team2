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
      displayName: "poll-integration",
      ...commonConfig,
      testMatch: ["**/integration/**/poll*.test.ts"],
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
      displayName: "apartmentInfo-api",
      ...commonConfig,
      testMatch: ["**/integrationTest/apartmentInfo*.test.ts"],
    },
    {
      displayName: "apartmentInfo-unit",
      ...commonConfig,
      testMatch: ["**/unitTest/**/apartmentInfo*.unit.test.ts"],
    },
  ],
};
