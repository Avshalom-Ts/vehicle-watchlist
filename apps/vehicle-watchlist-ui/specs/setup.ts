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
            enterLicensePlate: 'Enter license plate number',
            enterValue: 'Enter search value',
            search: 'Search',
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
                setLocale: () => {},
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
                    setLocale: () => {},
                    t,
                    dir: 'ltr',
                };
            }
            return context;
        },
    };
});
