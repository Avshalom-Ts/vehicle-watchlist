// Mock for react-dom/test-utils to fix React 19 compatibility
// React 19 moved `act` to `react` package, this provides the bridge
const React = require('react');

// Re-export act from React (React 19's location)
export const act = React.act;
