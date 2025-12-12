'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'he' | 'en';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'preferred-locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('he'); // Hebrew as default
    const [messages, setMessages] = useState<Record<string, any>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load saved locale from localStorage
        const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
        if (savedLocale && (savedLocale === 'he' || savedLocale === 'en')) {
            setLocaleState(savedLocale);
        }
    }, []);

    useEffect(() => {
        // Load messages for current locale
        import(`../../messages/${locale}.json`)
            .then((module) => setMessages(module.default))
            .catch(() => setMessages({}));

        // Update HTML attributes
        if (mounted) {
            document.documentElement.lang = locale;
            document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
        }
    }, [locale, mounted]);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = messages;

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }

        return typeof value === 'string' ? value : key;
    };

    const dir = locale === 'he' ? 'rtl' : 'ltr';

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}
