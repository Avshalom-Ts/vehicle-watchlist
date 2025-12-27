import React, { ReactElement, createContext, useContext } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock i18n context for tests
type Locale = 'he' | 'en';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Export useI18n for components that use it
export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}

// Mock messages for tests
const mockMessages = {
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

interface AllProvidersProps {
    children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: unknown = mockMessages;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                return key;
            }
        }
        return typeof value === 'string' ? value : key;
    };

    const contextValue: I18nContextType = {
        locale: 'en',
        setLocale: () => {},
        t,
        dir: 'ltr',
    };

    return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
    return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
