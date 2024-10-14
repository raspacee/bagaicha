/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  roots: ["./"], // Point to your TypeScript source directory
  testMatch: ["**/__tests__/**/*.test.ts"], // Match only test files in your source code
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        isolatedModules: true,
      },
    ], // Use ts-jest to handle TypeScript
  },
  moduleFileExtensions: ["ts", "js"],
  testPathIgnorePatterns: ["./node_modules/", "./build/"], // Ignore the build directory
};
