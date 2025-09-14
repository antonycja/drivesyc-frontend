'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { FormField } from './FormField';
import { ErrorMessage } from './ErrorMessage';
import { SuccessMessage } from './SuccessMessage';
import { LoadingButton } from './LoadingButton';
import { validateEmail } from './utils/validation';

interface PasswordResetFormProps {
  onBackToLogin: () => void;
  error: string;
  setError: (error: string) => void;
}

export function PasswordResetForm({ onBackToLogin, error, setError }: PasswordResetFormProps) {
  const [resetEmail, setResetEmail] = useState('');
  const [isResetPending, setIsResetPending] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail || !validateEmail(resetEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsResetPending(true);
    setError('');
    setResetSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.toLowerCase().trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        setResetSuccess('Password reset instructions have been sent to your email.');
        setResetEmail('');
        setTimeout(() => onBackToLogin(), 3000);
      } else {
        setError(result.message || 'Failed to send reset email.');
      }
    } catch (error) {
      setError('Unable to process request. Please try again later.');
    } finally {
      setIsResetPending(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Reset Password</h2>
        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <form onSubmit={handlePasswordReset}>
        <FormField
          id="resetEmail"
          label="Email Address"
          type="email"
          value={resetEmail}
          onChange={setResetEmail}
          placeholder="Enter your email"
          icon={Mail}
          required
        />

        {error && <ErrorMessage message={error} />}
        {resetSuccess && <SuccessMessage message={resetSuccess} />}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBackToLogin}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Login
          </button>
          <LoadingButton
            type="submit"
            isLoading={isResetPending}
            loadingText="Sending..."
            disabled={!resetEmail}
            className="flex-1"
          >
            Send Reset Link
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}