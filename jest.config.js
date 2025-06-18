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
  ],
};
