"use client";

import React from 'react';
import { useTheme } from '../providers/ThemeProvider';
import { FiSun, FiMoon } from 'react-icons/fi';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`theme-toggle ${className}`}>
      <div className="theme-toggle__label">
        <span className="icon sun"><FiSun /></span>
        <span className="theme-name">Light</span>
      </div>
      
      <button 
        onClick={toggleTheme}
        className={`theme-toggle__switch ${isDark ? 'is-dark' : 'is-light'}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <span className="toggle-track">
          <span className="toggle-thumb"></span>
        </span>
      </button>
      
      <div className="theme-toggle__label">
        <span className="icon moon"><FiMoon /></span>
        <span className="theme-name">Dark</span>
      </div>
    </div>
  );
}; 