export default {
  testEnvironment: "node",
  transform: {},
  moduleFileExtensions: ["js", "json"],
  testMatch: ["**/tests/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  verbose: true
};