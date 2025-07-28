"use client";

import React, { ReactNode } from "react";

interface TextAreaProps {
  label: string;
  helpText?: string;
  children: ReactNode;
  className?: string;
}

export function TextArea({ label, helpText, children, className }: TextAreaProps) {
  const id = `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className={className}>
      <label className="mb-1 block font-semibold text-gray-700" htmlFor={id}>
        {label}
      </label>
      {children}
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
}

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

TextArea.Input = function TextAreaInput({ className, ...props }: TextAreaInputProps) {
  return (
    <textarea
      id="textarea"
      {...props}
      className={`w-full rounded border border-gray-300 px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ""}`}
    />
  );
};

export default TextArea;
