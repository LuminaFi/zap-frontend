"use client";

import React from 'react';
import { useLanguage, Language } from '../providers/LanguageProvider';
import { FiGlobe } from 'react-icons/fi';

interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as Language;
    setLanguage(newLanguage);
  };

  return (
    <div className={`language-toggle ${className}`}>
      <div className="language-toggle__label">
        <FiGlobe className="icon globe" />
        <span className="language-name">{t('profile.language')}</span>
      </div>
      
      <div className="language-toggle__select-container">
        <select 
          value={language}
          onChange={handleLanguageChange}
          className="language-toggle__select"
          aria-label="Select language"
        >
          <option value="en">{t('profile.english')}</option>
          <option value="id">{t('profile.indonesian')}</option>
        </select>
      </div>
    </div>
  );
}; 