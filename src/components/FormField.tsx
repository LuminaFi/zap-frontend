"use client";

import React, { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, ...props }) => {
  return (
    <div className="form-field">
      <label className="form-field__label">{label}</label>
      <input className="form-field__input" {...props} />
    </div>
  );
}; 