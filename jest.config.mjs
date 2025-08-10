export default {
  projects: [
    {
      displayName: 'frontend',
      rootDir: '<rootDir>/front',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/tests/**/*.test.js'],
      transform: {},
    },
    {
      displayName: 'backend',
      rootDir: '<rootDir>/back',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/**/*.test.js'],
      transform: {},
    }
  ]
};
