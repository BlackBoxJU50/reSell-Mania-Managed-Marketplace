import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'bn' : 'en');
    };

    const t = (path) => {
        const keys = path.split('.');
        let result = translations[language];
        for (const key of keys) {
            result = result?.[key];
        }
        return result || path;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
