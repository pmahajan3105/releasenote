"use client";

import React, { ReactNode } from "react";

interface TextFieldProps {
  label: string;
  helpText?: string;
  icon?: ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function TextField({ label, helpText, icon, children, className }: TextFieldProps) {
  const id = `textfield-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block font-semibold text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        {children}
      </div>
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
}

interface TextFieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

TextField.Input = function TextFieldInput({ className, ...props }: TextFieldInputProps) {
  return (
    <input
      id="textfield"
      {...props}
      className={`w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ""}`}
    />
  );
};

export default TextField;
