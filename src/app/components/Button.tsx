"use client";

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'secondary' | 'accent' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const variantClass = 
    variant === 'outline' ? 'button--outline' : 
    variant === 'secondary' ? 'button--secondary' : 
    variant === 'accent' ? 'button--accent' : 
    variant === 'danger' ? 'button--danger' : '';
  
  const sizeClass = 
    size === 'small' ? 'button--small' : 
    size === 'large' ? 'button--large' : '';
  
  const widthClass = fullWidth ? 'button--full-width' : '';
  
  return (
    <button
      className={`button ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}; 