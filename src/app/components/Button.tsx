"use client";

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  return (
    <button
      className={`button ${variant === 'outline' ? 'button--outline' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}; 