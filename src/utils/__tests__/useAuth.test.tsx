import React, { RefObject } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth, AuthProvider } from '../../hooks/useAuth';
import * as authService from '../../services/authService';
import { AuthContextType, User } from '../../types';

// Mock auth service
jest.mock('../../services/authService');

describe('useAuth', () => {
  // TEST CONSTANTS
  const TEST_EMAIL = 'test@example.com';
  const TEST_PASSWORD = 'password123';
  const TEST_WRONG_PASSWORD = 'wrongpassword';
  const TEST_USER: User = {
    uid: 'user-123',
    email: TEST_EMAIL,
    emailVerified: false,
  };

  // SETUP
  beforeEach(() => {
    jest.clearAllMocks();
    setupNoUser(); // Default: no user signed in
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  // HELPER FUNCTIONS

  /**
   * Setup auth state changed to return no user
   */
  const setupNoUser = () => {
    (authService.onAuthStateChanged as jest.Mock).mockImplementation(
      (callback) => {
        callback(null);
        return jest.fn();
      }
    );
  };

  /**
   * Setup auth state changed to return signed-in user
   */
  const setupSignedInUser = () => {
    (authService.onAuthStateChanged as jest.Mock).mockImplementation(
      (callback) => {
        callback(TEST_USER);
        return jest.fn();
      }
    );
  };

  /**
   * Render hook and wait for loading to complete
   */
  const renderAuthHook = async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    return result;
  };

  /**
   * Render hook with signed-in user already loaded
   */
  const renderWithSignedInUser = async () => {
    setupSignedInUser();
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(TEST_USER);
    });

    return result;
  };

  /**
   * Generic error handler test helper
   * Tests that auth operations properly catch errors and set error state
   */
  const testErrorHandling = async (
    mockFn: jest.Mock,
    operation: (result: RefObject<AuthContextType>) => Promise<void>,
    errorMessage = 'Test error',
    shouldCheckUser = true
  ) => {
    mockFn.mockRejectedValue(new Error(errorMessage));

    const result = await renderAuthHook();

    let caughtError: Error | null = null;

    await act(async () => {
      try {
        await operation(result);
      } catch (error) {
        // Capture the error for verification
        caughtError = error as Error;
      }
    });

    // Verify the error was thrown
    expect(caughtError).toBeTruthy();
    expect(caughtError!.message).toContain(errorMessage);

    // Verify hook's error state was set
    expect(result.current.error).toBeTruthy();

    // Verify user state (most auth errors should leave user null)
    if (shouldCheckUser) {
      expect(result.current.user).toBeNull();
    }
  };

  // TESTS

  /**
   * Tests that the hook initializes
   */
  describe('initialization', () => {
    it('should initialize with no user when not previously authenticated', async () => {
      // Firebase has no session - fresh user
      const result = await renderAuthHook();

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should restore user session from Firebase on app restart', async () => {
      // Scenario: User was logged in, closed app, now reopening
      // Firebase has persisted session that should be restored
      setupSignedInUser();

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Hook should receive the persisted user from Firebase
      await waitFor(() => {
        expect(result.current.user).toEqual(TEST_USER);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  /**
   * Tests that a user can sign up successfully
   */
  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      (authService.signIn as jest.Mock).mockResolvedValue(TEST_USER);

      const result = await renderAuthHook();

      await act(async () => {
        await result.current.signIn(TEST_EMAIL, TEST_PASSWORD);
      });

      expect(authService.signIn).toHaveBeenCalledWith(
        TEST_EMAIL,
        TEST_PASSWORD
      );
    });

    it('should show loading state during sign in', async () => {
      let resolveSignIn: (value: User) => void;
      const signInPromise = new Promise<User>((resolve) => {
        resolveSignIn = resolve;
      });

      // Store the callback from onAuthStateChanged so we can fire it after sign-in
      let authStateCallback: ((user: User | null) => void) | null = null;
      (authService.onAuthStateChanged as jest.Mock).mockImplementation(
        (callback) => {
          // Call immediately with null (initial state)
          callback(null);
          // Store callback to fire later when sign-in completes
          authStateCallback = callback;
          return jest.fn();
        }
      );

      (authService.signIn as jest.Mock).mockReturnValue(signInPromise);

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.signIn(TEST_EMAIL, TEST_PASSWORD);
      });

      // Should be loading
      expect(result.current.loading).toBe(true);

      // Resolve the promise and simulate onAuthStateChanged firing
      await act(async () => {
        resolveSignIn!(TEST_USER);
        await signInPromise;
        // Simulate Firebase auth state change after successful sign-in
        if (authStateCallback) {
          authStateCallback(TEST_USER);
        }
      });

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle sign in errors gracefully', async () => {
      await testErrorHandling(
        authService.signIn as jest.Mock,
        async (result) => {
          await result.current.signIn(TEST_EMAIL, TEST_WRONG_PASSWORD);
        },
        'Invalid email or password'
      );
    });
  });

  /**
   * Tests that a user can sign up successfully
   */
  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      (authService.signUp as jest.Mock).mockResolvedValue(TEST_USER);

      const result = await renderAuthHook();

      await act(async () => {
        await result.current.signUp(TEST_EMAIL, TEST_PASSWORD);
      });

      expect(authService.signUp).toHaveBeenCalledWith(
        TEST_EMAIL,
        TEST_PASSWORD
      );
    });

    it('should handle sign up errors gracefully', async () => {
      await testErrorHandling(
        authService.signUp as jest.Mock,
        async (result) => {
          await result.current.signUp(TEST_EMAIL, TEST_PASSWORD);
        },
        'Email already in use'
      );
    });
  });

  /**
   * Tests that a user can sign out successfully
   */
  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      (authService.signOut as jest.Mock).mockResolvedValue(undefined);

      const result = await renderWithSignedInUser();

      await act(async () => {
        await result.current.signOut();
      });

      expect(authService.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors gracefully', async () => {
      setupSignedInUser();
      (authService.signOut as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const result = await renderWithSignedInUser();

      let caughtError: Error | null = null;

      await act(async () => {
        try {
          await result.current.signOut();
        } catch (error) {
          // Capture the error for verification
          caughtError = error as Error;
        }
      });

      expect(caughtError).toBeTruthy();
      expect(result.current.error).toBeTruthy();
    });
  });

  /**
   * Tests that errors are properly cleared
   */
  describe('error clearing', () => {
    it('should clear errors on subsequent successful operations', async () => {
      // First, cause an error
      (authService.signIn as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );

      const result = await renderAuthHook();

      let caughtError: Error | null = null;

      await act(async () => {
        try {
          await result.current.signIn(TEST_EMAIL, TEST_WRONG_PASSWORD);
        } catch (error) {
          // Capture the error for verification
          caughtError = error as Error;
        }
      });

      // Verify the error was thrown and set
      expect(caughtError).toBeTruthy();
      expect(result.current.error).toBeTruthy();

      // Now succeed
      (authService.signIn as jest.Mock).mockResolvedValue(TEST_USER);

      await act(async () => {
        await result.current.signIn(TEST_EMAIL, TEST_PASSWORD);
      });

      expect(result.current.error).toBeNull();
    });
  });
});
