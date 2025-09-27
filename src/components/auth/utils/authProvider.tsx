'use client'
import { ReactNode, createContext, useContext, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import ApiProxy from '@/app/api/lib/proxy';

interface User {
  name: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  approval_status: string;
  is_active: boolean;
  driving_school_id: number;
  is_owner?: boolean;
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: any;
  login: (onSuccess?: (user: User) => void) => Promise<boolean>;
  logout: () => void;
  mutate: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const fetcher = async (url: string): Promise<User | null> => {
  console.log('Fetching user from:', url);
  
  const { data, status } = await ApiProxy.get(url);
  
  console.log('Response status:', status);
  
  if (status === 200) {
    console.log('Response data:', data);
    
    return {
      name: `${data.first_name} ${data.last_name}`,
      email: data.email,
      role: data.role,
      first_name: data.first_name,
      last_name: data.last_name,
      approval_status: data.approval_status,
      is_active: data.is_active,
      driving_school_id: data.driving_school_id,
      is_owner: data.is_owner || data.role === 'owner'
    };
  }
  
  if (status === 401) {
    // console.log('Trying to refresh');
    // const tried = await fetch('/api/refresh')

    // console.log("Tried: ", tried.json())
    console.log('User not authenticated');

    return null;
  }
  
  throw new Error(`HTTP ${status}`);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  const { 
    data: user, 
    error, 
    isLoading: loading, 
    mutate 
  } = useSWR<User | null>('/api/me', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: (error) => error.status !== 401,
    dedupingInterval: 5000,
    onError: (error) => {
      // Handle auth errors globally
      if (error.status === 401) {
        console.log('Global auth error detected');
        // Don't redirect if already on login page or public pages
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password', '/'];
          
          if (!publicPaths.includes(currentPath)) {
            const returnUrl = encodeURIComponent(currentPath + window.location.search);
            router.push(`/auth/login?returnUrl=${returnUrl}`);
          }
        }
      }
    }
  });

  const isAuthenticated = !!user && !error;

  const login = async (onSuccess?: (user: User) => void): Promise<boolean> => {
    console.log('Login called - triggering SWR revalidation');
    
    const updatedUser = await mutate();
    
    if (updatedUser) {
      console.log('Login successful:', updatedUser);
      if (onSuccess) {
        onSuccess(updatedUser);
      }
      return true;
    } else {
      console.log('Login failed - no user data after revalidation');
      return false;
    }
  };

  const logout = async () => {
    try {
      await ApiProxy.post('/api/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      mutate(null, false);
      router.push('/auth/login');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user: user || null, 
        loading,
        error,
        login, 
        logout, 
        mutate
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
