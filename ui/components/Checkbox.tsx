"use client";

import React from "react";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ label, checked, onCheckedChange, className }: CheckboxProps) {
  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
      />
      {label && <span className="text-sm text-default-font">{label}</span>}
    </label>
  );
}
