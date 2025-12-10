const nextJest = require('next/jest.js');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  displayName: 'vehicle-watchlist-ui',
  preset: '../../jest.preset.js',
  setupFiles: ['<rootDir>/specs/setupEnv.ts'],
  setupFilesAfterEnv: ['<rootDir>/specs/setup.ts'],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/vehicle-watchlist-ui',
  testEnvironment: 'jsdom',
  // Fix for React 19 compatibility with @testing-library/react
  moduleNameMapper: {
    '^react-dom/test-utils$': '<rootDir>/specs/__mocks__/react-dom/test-utils.ts',
  },
};

module.exports = createJestConfig(config);
