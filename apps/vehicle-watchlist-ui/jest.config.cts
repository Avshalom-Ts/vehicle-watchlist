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
    '^@/components/ui/card$': '<rootDir>/specs/__mocks__/@/components/ui/card.tsx',
    '^@/components/ui/button$': '<rootDir>/specs/__mocks__/@/components/ui/button.tsx',
    '^@/components/ui/input$': '<rootDir>/specs/__mocks__/@/components/ui/input.tsx',
    '^@/components/ui/label$': '<rootDir>/specs/__mocks__/@/components/ui/label.tsx',
    '^@/components/ui/select$': '<rootDir>/specs/__mocks__/@/components/ui/select.tsx',
    '^@/components/ui/dialog$': '<rootDir>/specs/__mocks__/@/components/ui/dialog.tsx',
    '^@/components/ui/collapsible$': '<rootDir>/specs/__mocks__/@/components/ui/collapsible.tsx',
    '^@/components/ui/badge$': '<rootDir>/specs/__mocks__/@/components/ui/badge.tsx',
  },
};

module.exports = createJestConfig(config);
