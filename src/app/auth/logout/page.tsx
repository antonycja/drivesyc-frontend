'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/utils/authProvider';
import ApiProxy from '@/app/api/lib/proxy'

export default function LogoutPage() {
  const auth = useAuth()
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      const { data, status } = await ApiProxy.post('/api/logout', {}, true);

      if (status === 200) {
        setLogoutSuccess(true);
        auth.logout()
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.replace('/auth/login');
        }, 2000);
      } 
      else {
        const result = data
        setLogoutError(result.message || 'Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutError('Unable to process logout request. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleStayLoggedIn = () => {
    router.back(); // Go back to previous page
  };

  if (logoutSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Logged Out Successfully</h1>
            <p className="text-gray-600 mb-4">You have been safely logged out of your account.</p>
            <p className="text-sm text-gray-500">Redirecting you to the login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <LogOut className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign Out</h1>
          <p className="text-gray-600">Are you sure you want to logout?</p>
        </div>

        {/* Logout Confirmation Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {logoutError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{logoutError}</span>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                isLoggingOut
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
              }`}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Yes, Sign Me Out
                </>
              )}
            </button>

            <button
              onClick={handleStayLoggedIn}
              disabled={isLoggingOut}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel, Stay Logged In
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              You will be redirected to the login page after signing out
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a
              href="/support"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}