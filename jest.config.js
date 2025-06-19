module.exports = {
  projects: [
    {
      displayName: "poll-unit",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["**/unit/**/poll*.test.ts"],
    },
    {
      displayName: "poll-api",
      preset: "ts-jest",
      testEnvironment: "node",
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
    },
  ],
};
