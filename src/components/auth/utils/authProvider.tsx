'use client'
import { ReactNode, createContext, useContext } from 'react'
import useSWR from 'swr'

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
  mutate: () => void; // SWR's mutate function for manual revalidation
};

const AuthContext = createContext<AuthContextType | null>(null);

// SWR fetcher function
const fetcher = async (url: string): Promise<User | null> => {
  console.log('Fetching user from:', url);
  
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  
  console.log('Response status:', response.status);
  
  if (response.ok) {
    const data = await response.json();
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
  
  if (response.status === 401) {
    // Not authenticated - this is expected, not an error
    console.log('User not authenticated');
    return null;
  }
  
  // For other errors, throw so SWR knows it's an error
  throw new Error(`HTTP ${response.status}`);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use SWR to fetch user data
  const { 
    data: user, 
    error, 
    isLoading: loading, 
    mutate 
  } = useSWR<User | null>('/api/me', fetcher, {
    // SWR options
    revalidateOnFocus: false, // Don't refetch when window regains focus
    revalidateOnReconnect: true, // Refetch when internet connection is restored
    shouldRetryOnError: (error) => {
      // Don't retry on 401 (unauthorized) - user is just not logged in
      return error.status !== 401;
    },
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
  });

  const isAuthenticated = !!user && !error;

  const login = async (onSuccess?: (user: User) => void): Promise<boolean> => {
    console.log('Login called - triggering SWR revalidation');
    
    // Revalidate the user data
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
      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear the SWR cache and set user to null
      mutate(null, false);
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