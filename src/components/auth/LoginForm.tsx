'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { MainLoginForm } from '@/components/auth/MainLoginForm';
import { useLoginValidation } from '@/components/auth/hooks/useLoginValidation';
import { useAuth } from '@/components/auth/utils/authProvider';
import ApiProxy from '@/app/api/lib/proxy'


interface LoginFormProps {
  error?: string;
  success?: string;
}

export default function LoginForm({ error: initialError, success }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  
  // Get return URL from search params
  const returnUrl = searchParams.get('returnUrl') || '';
  
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

  const parseReturnUrl = (url: string) => {
    if (!url) return { path: '', view: '', description: '' };
    
    const decodedUrl = decodeURIComponent(url);
    
    // Parse different URL formats
    if (decodedUrl.includes('?view=')) {
      const urlParts = decodedUrl.split('?view=');
      const path = urlParts[0];
      const view = urlParts[1];
      return {
        path,
        view,
        description: getViewDescription(view)
      };
    }
    
    if (decodedUrl.includes('#')) {
      const parts = decodedUrl.split('#');
      const path = parts[0];
      const view = parts[1];
      return {
        path,
        view,
        description: getViewDescription(view)
      };
    }
    
    return {
      path: decodedUrl,
      view: '',
      description: decodedUrl
    };
  };

  const getViewDescription = (view: string) => {
    const viewDescriptions = {
      'dashboard': 'Dashboard',
      'bookings': 'Bookings',
      'create-booking': 'Create Booking',
      'instructors': 'Instructors',
      'students': 'Students',
      'vehicles': 'Vehicles',
      'reports': 'Reports',
      'finance': 'Finance',
      'settings': 'Settings'
    };
    
    return viewDescriptions[view] || view;
  };

  const getRedirectRoute = (user: any, apiRoute?: string) => {
    // If there's a return URL, use it
    if (returnUrl) {
      const decodedUrl = decodeURIComponent(returnUrl);
      console.log('Redirecting to return URL:', decodedUrl);
      return decodedUrl;
    }
    
    // If API provided a route, use it
    if (apiRoute) {
      return apiRoute;
    }
    
    // Fallback based on user role
    if (user?.role === 'owner') {
      return '/owner/dashboard';
    } else if (user?.role === 'instructor') {
      return '/instructor/dashboard';
    } else {
      return '/dashboard';
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(emailOrPhone, password)) {
      return;
    }

    setIsLoginPending(true);
    setError('');

    try {
      const { data, status } = await ApiProxy.post('/api/login', {
        body: {
          emailOrPhone: emailOrPhone.toLowerCase().trim(),
          password,
          rememberMe
        },
      }, false);

      const result = data

      if (status === 200) {
        if (result.loggedIn) {
          console.log('Login API successful, updating auth state...');
          
          const loginSuccess = await auth.login();
          
          if (loginSuccess && auth.user) {
            console.log('Auth state updated successfully, redirecting...');
            const redirectRoute = getRedirectRoute(auth.user, result.route);
            
            // Handle different redirect scenarios
            if (redirectRoute.includes('?view=') || redirectRoute.includes('#')) {
              // For SPA views, use window.location for immediate redirect
              window.location.href = redirectRoute;
            } else {
              // For regular routes, use Next.js router
              router.replace(redirectRoute);
            }
          } else {
            console.log('Auth state update failed, redirecting anyway...');
            const redirectRoute = getRedirectRoute(null, result.route);
            
            if (redirectRoute.includes('?view=') || redirectRoute.includes('#')) {
              window.location.href = redirectRoute;
            } else {
              router.replace(redirectRoute);
            }
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

  const returnUrlInfo = parseReturnUrl(returnUrl);

  return (
    <div>
      {returnUrl && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            Please log in to continue to: 
            <span className="font-medium ml-1">
              {returnUrlInfo.description}
            </span>
          </p>
        </div>
      )}
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
    </div>
  );
}
