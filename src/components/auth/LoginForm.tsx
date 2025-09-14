'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordResetForm } from './PasswordResetForm';
import { MainLoginForm } from './MainLoginForm';
import { useLoginValidation } from './hooks/useLoginValidation';
import { useAuth } from './utils/authProvider';

interface LoginFormProps {
  error?: string;
  success?: string;
}

export default function LoginForm({ error: initialError, success }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  
  // Form state
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [error, setError] = useState(initialError || '');
  
  // Validation
  const {
    emailOrPhoneError,
    passwordError,
    validateForm,
    handleEmailOrPhoneChange: handleEmailOrPhoneValidation,
    handlePasswordChange: handlePasswordValidation,
  } = useLoginValidation();

  const handleEmailOrPhoneChange = (value: string) => {
    setEmailOrPhone(value);
    handleEmailOrPhoneValidation(value);
    if (error) setError('');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    handlePasswordValidation(value);
    if (error) setError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(emailOrPhone, password)) {
      return;
    }

    setIsLoginPending(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          emailOrPhone: emailOrPhone.toLowerCase().trim(),
          password,
          rememberMe
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.loggedIn) {
          // Trigger SWR to refetch user data, then redirect
          console.log('Login API successful, updating auth state...');
          
          const loginSuccess = await auth.login();
          
          if (loginSuccess && auth.user) {
            console.log('Auth state updated successfully, redirecting...');
            if (result.route) {
              router.replace(result.route);
            } else {
              // Fallback redirect based on user role
              if (auth.user.role === 'owner') {
                router.replace('/owner/dashboard');
              } else if (auth.user.role === 'instructor') {
                router.replace('/instructor/dashboard');
              } else {
                router.replace('/dashboard');
              }
            }
          } else {
            console.log('Auth state update failed, redirecting anyway...');
            // Fallback: redirect anyway since login API succeeded
            router.replace(result.route || '/dashboard');
          }
        } else {
          router.replace('/auth/login');
        }
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Unable to process login request. Please try again later.');
    } finally {
      setIsLoginPending(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setError('');
  };

  if (showForgotPassword) {
    return (
      <PasswordResetForm 
        onBackToLogin={handleBackToLogin}
        error={error}
        setError={setError}
      />
    );
  }

  return (
    <MainLoginForm
      emailOrPhone={emailOrPhone}
      password={password}
      rememberMe={rememberMe}
      isLoginPending={isLoginPending}
      error={error}
      success={success}
      emailOrPhoneError={emailOrPhoneError}
      passwordError={passwordError}
      onEmailOrPhoneChange={handleEmailOrPhoneChange}
      onPasswordChange={handlePasswordChange}
      onRememberMeChange={setRememberMe}
      onSubmit={handleLoginSubmit}
      onShowForgotPassword={() => setShowForgotPassword(true)}
    />
  );
}