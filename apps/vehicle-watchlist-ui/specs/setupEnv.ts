// This runs BEFORE the test environment is set up
// Needed to patch React.act before @testing-library/react loads

// Polyfill globalThis.IS_REACT_ACT_ENVIRONMENT for React 19  
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Ensure React.act is available for React 19 compatibility
// In React 19 production builds, act may not be exposed correctly
const React = require('react');

if (typeof React.act !== 'function') {
    // Provide a minimal act implementation for testing
    React.act = (callback) => {
        const result = callback();
        if (result && typeof result.then === 'function') {
            return result;
        }
        return Promise.resolve(result);
    };
}
