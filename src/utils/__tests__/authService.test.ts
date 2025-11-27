import * as authService from '../../services/authService';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// Mock Firebase Auth functions
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock the auth instance (if needed)
jest.mock('../../config/firebaseConfig', () => ({
  auth: {},
}));

describe('authService', () => {
  const TEST_EMAIL = 'test@example.com';
  const TEST_PASSWORD = 'password123';

  const MOCK_USER = {
    uid: 'user-123',
    email: TEST_EMAIL,
    emailVerified: false,
    displayName: null,
    photoURL: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TESTS FOR SIGN UP
  describe('signUp', () => {
    it('should create user successfully', async () => {
      // Mock the Firebase function
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: MOCK_USER,
      });

      const result = await authService.signUp(TEST_EMAIL, TEST_PASSWORD);

      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(result).toEqual({
        uid: 'user-123',
        email: TEST_EMAIL,
        emailVerified: false,
        displayName: null,
        photoURL: null,
      });
    });

    it('should handle email-already-in-use error', async () => {
      const firebaseError = {
        code: 'auth/email-already-in-use',
        message: 'Email already in use',
      };

      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(
        firebaseError
      );

      await expect(
        authService.signUp(TEST_EMAIL, TEST_PASSWORD)
      ).rejects.toThrow('This email is already registered');
    });

    it('should handle invalid-email error', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/invalid-email',
      });

      await expect(
        authService.signUp(TEST_EMAIL, TEST_PASSWORD)
      ).rejects.toThrow('Please enter a valid email address');
    });

    it('should handle weak-password error', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/weak-password',
      });

      await expect(
        authService.signUp(TEST_EMAIL, TEST_PASSWORD)
      ).rejects.toThrow('Password should be at least 6 characters long');
    });

    it('should handle generic errors', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(
        new Error('Generic error')
      );

      await expect(
        authService.signUp(TEST_EMAIL, TEST_PASSWORD)
      ).rejects.toThrow('Generic error');
    });
  });

  // TESTS FOR SIGN IN
  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const signedInUser = {
        ...MOCK_USER,
        emailVerified: true,
        displayName: 'Test User',
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: signedInUser,
      });

      const result = await authService.signIn(TEST_EMAIL, TEST_PASSWORD);

      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(result).toEqual({
        uid: 'user-123',
        email: TEST_EMAIL,
        emailVerified: true,
        displayName: 'Test User',
        photoURL: null,
      });
    });

    it('should handle user-not-found error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/user-not-found',
      });

      await expect(
        authService.signIn(TEST_EMAIL, TEST_PASSWORD)
      ).rejects.toThrow('No account found with this email');
    });

    it('should handle wrong-password error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/wrong-password',
      });

      await expect(
        authService.signIn(TEST_EMAIL, TEST_PASSWORD)
      ).rejects.toThrow('Incorrect password');
    });

    it('should handle invalid-credential error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/invalid-credential',
      });

      await expect(
        authService.signIn(TEST_EMAIL, TEST_PASSWORD)
      ).rejects.toThrow('Invalid email or password');
    });

    it('should handle too-many-requests error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/too-many-requests',
      });

      await expect(
        authService.signIn(TEST_EMAIL, TEST_PASSWORD)
      ).rejects.toThrow('Too many failed attempts');
    });
  });

  // TESTS FOR SIGN OUT
  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      await authService.signOut();

      expect(signOut).toHaveBeenCalled();
    });

    it('should handle network error during signOut', async () => {
      (signOut as jest.Mock).mockRejectedValue({
        code: 'auth/network-request-failed',
      });

      await expect(authService.signOut()).rejects.toThrow(
        'Network error. Please check your internet connection'
      );
    });

    it('should handle generic signOut errors', async () => {
      (signOut as jest.Mock).mockRejectedValue(new Error('Unknown error'));

      await expect(authService.signOut()).rejects.toThrow('Unknown error');
    });
  });

  // TESTS FOR ON AUTH STATE CHANGED
  describe('onAuthStateChanged', () => {
    it('should call callback with user when signed in', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(MOCK_USER);
        return mockUnsubscribe;
      });

      const unsubscribe = authService.onAuthStateChanged(mockCallback);

      expect(onAuthStateChanged).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith({
        uid: 'user-123',
        email: TEST_EMAIL,
        emailVerified: false,
        displayName: null,
        photoURL: null,
      });
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should call callback with null when signed out', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(null);
        return mockUnsubscribe;
      });

      const unsubscribe = authService.onAuthStateChanged(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should return unsubscribe function', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      (onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);

      const unsubscribe = authService.onAuthStateChanged(mockCallback);

      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });
});
