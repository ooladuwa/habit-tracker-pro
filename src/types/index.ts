// User
export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName?: string | null;
  photoURL?: string | null;
}

// Auth context
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Auth error response
export interface AuthError {
  code: string;
  message: string;
}

// Navigation types
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
