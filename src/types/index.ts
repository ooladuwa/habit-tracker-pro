import type { Timestamp } from 'firebase/firestore';

/**
 *  User
 * @description Interface for the User object.
 */
export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName?: string | null;
  photoURL?: string | null;
}

/**
 * Auth context
 * @description Interface for the AuthContextType.
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

/**
 * Auth error response
 * @description Interface for the AuthError object.
 */
export interface AuthError {
  code: string;
  message: string;
}

/**
 *  Navigation types
 * @description Interface for the AuthStackParamList and AppStackParamList.
 */
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  HabitDetail: { habitId: string };
  AddHabit: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;

/**
 * Habit Model
 * @description A habit is a daily, weekly, or monthly activity that the user wants to track. What the app uses.
 */
export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  createdAt: string | Date;
  updatedAt: string | Date;
  completedDates: string[];
  color?: string;
  icon?: string;
}

/**
 * Habit input for creating/updating (no id, userId, timestamps)
 * @description The input data for creating or updating a habit. What the user provides.
 */
export interface HabitInput {
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  color?: string;
  icon?: string;
}

/**
 * Firestore document data (how it's stored in Firebase)
 * @description The data that is stored in Firebase with timestamps.
 * Timestamps can be Firestore Timestamp objects or ISO strings.
 */
export interface HabitDocument {
  userId: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  completedDates: string[];
  color?: string;
  icon?: string;
}

/**
 * Habits context type
 * @description Interface for the useHabits hook..
 */
export interface HabitsContextType {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  createHabit: (input: HabitInput) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<HabitInput>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (id: string, date: string) => Promise<void>;
  refreshHabits: () => Promise<void>;
  clearError: () => void;
}
