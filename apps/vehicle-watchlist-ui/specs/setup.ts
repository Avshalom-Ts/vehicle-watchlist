import '@testing-library/jest-dom';

// Mock the i18n provider module
jest.mock('../src/lib/i18n-provider', () => {
    const React = require('react');
    const { createContext, useContext } = React;

    const mockMessages = {
        common: {
            vehicleWatchlist: 'Vehicle Watchlist',
            login: 'Login',
            register: 'Register',
            logout: 'Logout',
            dashboard: 'Dashboard',
            searchVehicles: 'Search Vehicles',
            myWatchlist: 'My Watchlist',
            analytics: 'Analytics',
        },
        auth: {
            logoutSuccess: 'Logged out successfully',
            name: 'Name',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            namePlaceholder: 'Enter your name',
            emailPlaceholder: 'you@example.com',
            passwordPlaceholder: 'Enter your password',
            createPassword: 'Create a password',
            confirmPasswordPlaceholder: 'Confirm your password',
            passwordRequirements: 'Minimum 8 characters with uppercase, lowercase and number',
            signUp: 'Sign Up',
            signUpDescription: 'Create an account to get started',
            signIn: 'Sign In',
            signInDescription: 'Sign in to your account',
            signInButton: 'Sign In',
            signingIn: 'Signing in...',
            accountCreated: 'Account created successfully!',
            registrationFailed: 'Registration failed. Please try again.',
            loginFailed: 'Login failed. Please check your credentials.',
            welcomeBack: 'Welcome back!',
            alreadyHaveAccount: 'Already have an account?',
            dontHaveAccount: 'Don\'t have an account?',
            signUpHere: 'Sign up here',
            signInHere: 'Sign in here',
            signUpButton: 'Sign Up',
            creatingAccount: 'Creating account...',
            validation: {
                nameMinLength: 'Name must be at least 2 characters',
                nameRequired: 'Name is required',
                emailRequired: 'Email is required',
                emailInvalid: 'Invalid email address',
                passwordRequired: 'Password is required',
                passwordMinLength: 'Password must be at least 8 characters',
                passwordUppercase: 'Password must contain at least one uppercase letter',
                passwordLowercase: 'Password must contain at least one lowercase letter',
                passwordNumber: 'Password must contain at least one number',
                confirmPasswordRequired: 'Please confirm your password',
                passwordsMismatch: 'Passwords do not match',
            },
        },
        navbar: {
            brand: 'Vehicle Watchlist',
            home: 'Home',
            search: 'Search',
            watchlist: 'Watchlist',
            login: 'Login',
            register: 'Register',
            logout: 'Logout',
            theme: 'Toggle theme',
            language: 'Language',
            signedInAs: 'Signed in as',
        },
        searchForm: {
            searchBy: 'Search by',
            licensePlate: 'License Plate',
            manufacturer: 'Manufacturer',
            model: 'Model',
            color: 'Color',
            fuelType: 'Fuel Type',
            ownership: 'Ownership',
            allFilters: 'All Filters',
            platePlaceholder: 'Enter license plate number (e.g., 1234567)',
            enterLicensePlate: 'Enter license plate number',
            enterValue: 'Enter search value',
            search: 'Search',
            searchButton: 'Search',
            searching: 'Searching...',
            invalidPlate: 'Please enter a valid Israeli license plate (7 or 8 digits)',
            enterSearchValue: 'Please enter a search value',
            searchMode: 'Search Mode',
            traditional: 'Traditional',
            aiMode: 'AI Mode',
            aiPromptLabel: 'Describe the vehicle',
            aiPromptPlaceholder: 'Describe the vehicle you\'re looking for...',
            aiPromptHint: 'Example: White Toyota from 2015',
            aiSearchButton: 'AI Search',
            enterAiPrompt: 'Please enter a description',
            aiNotAvailable: 'AI search is currently unavailable',
            plateValidation: 'License plate must be 7-8 digits',
            filterNotAvailable: 'Filter search not available. Please select "License Plate" to search.',
        },
        home: {
            title: 'Vehicle Watchlist',
            subtitle: 'Search for Israeli vehicles',
        },
    };

    const I18nContext = createContext(undefined);

    const t = (key) => {
        const keys = key.split('.');
        let value = mockMessages;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key;
            }
        }
        return typeof value === 'string' ? value : key;
    };

    return {
        I18nProvider: ({ children }) => {
            const contextValue = {
                locale: 'en',
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                setLocale: () => { },
                t,
                dir: 'ltr',
            };
            return React.createElement(I18nContext.Provider, { value: contextValue }, children);
        },
        useI18n: () => {
            const context = useContext(I18nContext);
            if (!context) {
                return {
                    locale: 'en',
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    setLocale: () => { },
                    t,
                    dir: 'ltr',
                };
            }
            return context;
        },
    };
});
