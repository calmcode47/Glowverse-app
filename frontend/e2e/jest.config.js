module.exports = {
  testTimeout: 120000,
  testRegex: "\\.e2e\\.js$",
  reporters: ["detox/runners/jest/streamlineReporter"],
  setupFilesAfterEnv: ["detox/runners/jest/setup.js"]
};
