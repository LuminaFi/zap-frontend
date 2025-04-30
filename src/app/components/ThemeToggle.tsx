"use client";

import React from 'react';
import { BsSun, BsMoon } from 'react-icons/bs';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button 
      onClick={onToggle}
      className="theme-toggle"
    >
      <div className={`theme-toggle__slider ${isDark ? 'dark' : ''}`}>
        <div className="theme-toggle__icons">
          <BsSun className="sun" size={16} />
          <BsMoon className="moon" size={16} />
        </div>
        <div className="theme-toggle__circle" />
      </div>
    </button>
  );
}; 