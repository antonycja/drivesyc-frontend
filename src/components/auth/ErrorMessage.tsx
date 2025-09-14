'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      <span className="text-red-700 text-sm">{message}</span>
    </div>
  );
}