import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  FirestoreError,
  UpdateData,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Habit, HabitInput, HabitDocument } from '../types';

/**
 * Habit Service
 * @description Abstracts Firebase Firestore operations for habits
 */

/**
 * Get the habits collection reference for the current user
 * @returns The habits collection reference
 */
const getUserHabitsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'habits');
};

/**
 * Map Firestore document data to our Habit type
 * @param data The Firestore document data
 * @param id The habit's ID
 * @returns The mapped Habit
 */
const mapDocToHabit = (id: string, data: HabitDocument): Habit => {
  // Convert Timestamp to ISO string, or use string directly
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : data.createdAt || new Date().toISOString();

  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : data.updatedAt || new Date().toISOString();

  return {
    id,
    userId: data.userId,
    title: data.title,
    description: data.description || '',
    frequency: data.frequency,
    createdAt,
    updatedAt,
    completedDates: data.completedDates || [],
    color: data.color,
    icon: data.icon,
  };
};

/**
 * Handle Firestore errors
 * @param operation The operation that failed
 * @param error The error to handle
 * @returns The error message
 */
const handleFirestoreError = (
  error: FirestoreError,
  operation: string
): Error => {
  // Type guard for Firestore errors
  const isFirestoreError = (
    err: unknown
  ): err is { code: string; message?: string } => {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      typeof (err as { code: unknown }).code === 'string'
    );
  };

  // Default error message
  let message = `Failed to ${operation}. Please try again.`;

  // If the error is a Firestore error, handle it otherwise use the default message
  if (isFirestoreError(error)) {
    switch (error.code) {
      case 'permission-denied':
        message = 'You do not have permission to perform this action.';
        break;
      case 'not-found':
        message = 'The requested item was not found.';
        break;
      case 'already-exists':
        message = 'This item already exists.';
        break;
      case 'resource-exhausted':
        message = 'Too many requests. Please try again later.';
        break;
      case 'unavailable':
        message =
          'Service temporarily unavailable. Please check your connection.';
        break;
      default:
        message = error.message || message;
    }
  }

  return new Error(message);
};

/**
 * Create a new habit
 * @param userId The user's ID
 * @param input The habit to create provided by the user
 * @returns The created habit
 */
export const createHabit = async (
  userId: string,
  input: HabitInput
): Promise<Habit> => {
  try {
    const habitsRef = getUserHabitsCollection(userId);

    // Create habit data object without timestamps
    const habitData: Omit<HabitDocument, 'createdAt' | 'updatedAt'> = {
      userId,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      frequency: input.frequency,
      completedDates: [],
      color: input.color,
      icon: input.icon,
    };

    const docRef = await addDoc(habitsRef, {
      ...habitData,
      createdAt: serverTimestamp(), // Add timestamps to the habit data
      updatedAt: serverTimestamp(), // timestamp is a placeholder for the current time
    });

    // return the created habit
    return {
      id: docRef.id,
      ...habitData,
      createdAt: new Date(), // date comes from the user's device
      updatedAt: new Date(), // date changes milliseconds later when the habit is updated with the server timestamp
    };
  } catch (error: unknown) {
    // If an error occurs, throw it wrapped in our custom error
    console.error('❌ Error creating habit:', error);
    throw handleFirestoreError(error as FirestoreError, 'create habit');
  }
};

/**
 * Get all habits for a user
 * @param userId The user's ID
 * @returns The habits
 */
export const getHabits = async (userId: string): Promise<Habit[]> => {
  try {
    const habitsRef = getUserHabitsCollection(userId);

    const q = query(habitsRef, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);

    // Map the documents to our Habit type
    return querySnapshot.docs.map((doc) =>
      mapDocToHabit(doc.id, doc.data() as HabitDocument)
    );
  } catch (error: unknown) {
    console.error('❌ Error getting habits:', error);
    throw handleFirestoreError(error as FirestoreError, 'get habits');
  }
};

/**
 * Update a habit
 * @param userId The user's ID
 * @param habitId The habit's ID
 * @param updates The updates to make to the habit
 * @returns The updated habit
 */
export const updateHabit = async (
  userId: string,
  habitId: string,
  updates: Partial<HabitInput>
): Promise<void> => {
  try {
    const habitsRef = doc(db, 'users', userId, 'habits', habitId);

    const updateData: UpdateData<HabitDocument> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Clean up undefined values since Firestore hates undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    await updateDoc(habitsRef, updateData);
  } catch (error: unknown) {
    console.error('❌ Error updating habit:', error);
    throw handleFirestoreError(error as FirestoreError, 'update habit');
  }
};

/**
 * Delete a habit
 * @param userId The user's ID
 * @param habitId The habit's ID
 * @returns void
 */
export const deleteHabit = async (
  userId: string,
  habitId: string
): Promise<void> => {
  try {
    const habitsRef = doc(db, 'users', userId, 'habits', habitId);
    await deleteDoc(habitsRef);
  } catch (error: unknown) {
    console.error('❌ Error deleting habit:', error);
    throw handleFirestoreError(error as FirestoreError, 'delete habit');
  }
};

/**
 * Toggle habit completion for a specific date
 * @param userId The user's ID
 * @param habitId The habit's ID
 * @param date The date to toggle the habit completion for
 * @returns void
 */
export const toggleHabitCompletion = async (
  userId: string,
  habitId: string,
  date: string
): Promise<void> => {
  try {
    const habitRef = doc(db, 'users', userId, 'habits', habitId);

    // Get the current habit data
    const habitsRef = getUserHabitsCollection(userId);
    const q = query(habitsRef, where('__name__', '==', habitId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Habit not found');
    }

    const habitData = snapshot.docs[0].data() as HabitDocument;
    const completedDates = habitData.completedDates || [];

    // Toggle: remove if exists, add if it doesn't
    const dateIndex = completedDates.indexOf(date);
    const newCompletedDates =
      dateIndex < 0
        ? completedDates.filter((d) => d !== date)
        : [...completedDates, date];

    await updateDoc(habitRef, {
      completedDates: newCompletedDates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: unknown) {
    console.error('❌ Error toggling habit completion:', error);
    throw handleFirestoreError(
      error as FirestoreError,
      'toggle habit completion'
    );
  }
};

/**
 * Subscribe to real-time habit updates
 * @param userId The user's ID
 * @param onUpdate The callback to call when the habit is updated
 * @returns An unsubscribe function to stop listening
 */
export const subscribeToHabits = (
  userId: string,
  onUpdate: (habits: Habit[]) => void
) => {
  const habitsRef = getUserHabitsCollection(userId);
  const q = query(habitsRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const habits = snapshot.docs.map((doc) =>
        mapDocToHabit(doc.id, doc.data() as HabitDocument)
      );
      onUpdate(habits);
    },
    (error) => {
      console.error('❌ Error subscribing to habits:', error);
      throw handleFirestoreError(
        error as FirestoreError,
        'subscribe to habits'
      );
    }
  );

  return unsubscribe;
};
