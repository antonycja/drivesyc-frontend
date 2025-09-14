'use client';

import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
}

export function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
      <span className="text-green-700 text-sm">{message}</span>
    </div>
  );
}
