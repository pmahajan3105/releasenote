import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  headline: string;
  subtext?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, headline, subtext, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-4 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      {icon && <div className="mb-4 text-5xl text-gray-400 dark:text-gray-600">{icon}</div>}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{headline}</h2>
      {subtext && <p className="text-gray-500 dark:text-gray-400 mb-4">{subtext}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
