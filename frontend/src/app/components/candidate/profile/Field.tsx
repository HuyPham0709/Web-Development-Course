import React from 'react';

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      {/* Thêm dark:text-gray-400 cho label */}
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
        {label}
      </label>
      {children}
    </div>
  );
}

// Cập nhật inputCls với các tokens Dark mode chuẩn: dark:bg-white/5, dark:border-white/10
export const inputCls = 'w-full px-3.5 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-400 transition-all duration-300';