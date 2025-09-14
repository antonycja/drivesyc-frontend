'use client';

import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface LoadingButtonProps {
  children: ReactNode;
  isLoading: boolean;
  loadingText: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  onClick?: () => void;
}

export function LoadingButton({
  children,
  isLoading,
  loadingText,
  disabled,
  type = 'button',
  className = '',
  onClick,
}: LoadingButtonProps) {
  const isDisabled = isLoading || disabled;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
        isDisabled
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
      } ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
