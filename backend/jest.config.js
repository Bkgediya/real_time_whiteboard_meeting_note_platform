/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.\\.?:?\\/.*)\\.js$': '$1',
  },
  testMatch: ['**/tests/**/*.test.ts'],
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
