"use client";

import React, { ReactNode } from "react";

interface SelectProps {
  label: string;
  helpText?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Select({ label, helpText, placeholder, value, onValueChange, children, className }: SelectProps) {
  const id = `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block font-semibold text-gray-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

Select.Item = function SelectItem({ value, children }: SelectItemProps) {
  return <option value={value}>{children}</option>;
};

export default Select;
