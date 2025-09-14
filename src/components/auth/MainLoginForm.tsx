'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Phone, Lock } from 'lucide-react';
import { FormField } from './FormField';
import { ErrorMessage } from './ErrorMessage';
import { SuccessMessage } from './SuccessMessage';
import { LoadingButton } from './LoadingButton';
import { DemoCredentials } from './DemoCredentials';

interface MainLoginFormProps {
  emailOrPhone: string;
  password: string;
  rememberMe: boolean;
  isLoginPending: boolean;
  error: string;
  success?: string;
  emailOrPhoneError: string;
  passwordError: string;
  onEmailOrPhoneChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onShowForgotPassword: () => void;
}

export function MainLoginForm({
  emailOrPhone,
  password,
  rememberMe,
  isLoginPending,
  error,
  success,
  emailOrPhoneError,
  passwordError,
  onEmailOrPhoneChange,
  onPasswordChange,
  onRememberMeChange,
  onSubmit,
  onShowForgotPassword,
}: MainLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit}>
      {/* Username Field */}
      <FormField
        id="emailOrPhone"
        label="Username"
        type={emailOrPhone.trim().includes('@') ? 'email' : 'tel'}
        value={emailOrPhone}
        onChange={onEmailOrPhoneChange}
        placeholder="Enter your email or phone number"
        icon={emailOrPhone.trim().includes('@') ? Mail : Phone}
        error={emailOrPhoneError}
        disabled={isLoginPending}
        required
      />

      {/* Password Field */}
      <div className="mb-4">
        <FormField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={onPasswordChange}
          placeholder="Enter your password"
          icon={Lock}
          error={passwordError}
          disabled={isLoginPending}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoginPending}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-offset-0"
            disabled={isLoginPending}
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
        <button
          type="button"
          onClick={onShowForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          disabled={isLoginPending}
        >
          Forgot password?
        </button>
      </div>

      {/* Messages */}
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* Submit Button */}
      <LoadingButton
        type="submit"
        isLoading={isLoginPending}
        loadingText="Signing In..."
        className="w-full"
      >
        Sign In
      </LoadingButton>

      {/* Demo Credentials */}
      <DemoCredentials />
    </form>
  );
}