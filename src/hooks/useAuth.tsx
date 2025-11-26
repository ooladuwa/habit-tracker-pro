import { useState, useEffect, createContext, useContext } from 'react';
import * as authService from '../services/authService';
import { User, AuthContextType } from '../types';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Component
 * Wrap app with this to provide auth state
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  /**
   * Sign up new user
   */
  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await authService.signUp(email, password);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
      setLoading(false);
      throw err;
    }
  };

  /**
   * Sign in existing user
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await authService.signIn(email, password);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
      setLoading(false);
      throw err;
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await authService.signOut();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
      setLoading(false);
      throw err;
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
/**
 * Custom hook to use auth context
 * Must be used within AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
