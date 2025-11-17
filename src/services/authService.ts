import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { User } from '../types';

/**
 * Authentication Service
 * Abstracts Firebase Auth operations for easier testing and maintenance
 */

class AuthService {
  private auth: Auth;

  constructor(authInstance: Auth) {
    this.auth = authInstance;
  }

  /**
   * Create a new user with email and password
   */
  async signUp(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in existing user with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    const firebaseUser = this.auth.currentUser;
    return firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, (firebaseUser) => {
      const user = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
      callback(user);
    });
  }

  /**
   * Map Firebase User to our User type
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
  }

  /**
   * Convert Firebase auth errors to user-friendly messages
   */
  private handleAuthError(error: unknown): Error {
    let message = 'An unexpected error occurred. Please try again.';

    // Type guard for Firebase Auth errors
    const isFirebaseError = (
      err: unknown
    ): err is { code: string; message?: string } => {
      return (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        typeof (err as { code: unknown }).code === 'string'
      );
    };

    if (!isFirebaseError(error)) {
      return new Error(error instanceof Error ? error.message : message);
    }

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered. Please sign in instead.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/operation-not-allowed':
        message =
          'Email/password accounts are not enabled. Please contact support.';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters long.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email. Please sign up first.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-credential':
        message = 'Invalid email or password. Please check and try again.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection.';
        break;
      default:
        message = error.message ?? message;
    }

    return new Error(message);
  }
}

export const authService = new AuthService(auth);
