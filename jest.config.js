"use strict";

module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'dev/coverage',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testPathIgnorePatterns: ['<rootDir>/tests/tools/'],
  moduleNameMapper: {
    '@(/.*)$': '<rootDir>/src/$1',
    '@tests(/.*)$': '<rootDir>/tests/$1'
  }
};