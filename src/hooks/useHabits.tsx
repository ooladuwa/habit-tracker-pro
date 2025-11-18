import { useState, useEffect, createContext, useContext } from 'react';
import * as habitService from '../services/habitService';
import { useAuth } from './useAuth';
import { Habit, HabitInput, HabitsContextType } from '../types';

// Context for the habits state and actions
const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

/**
 * Habits Provider Props
 * @description Interface for the HabitsProviderProps.
 */
interface HabitsProviderProps {
  children: React.ReactNode;
}

/**
 * Habits Provider Component
 * Wrap app with this to provide habits state and actions
 */
export function HabitsProvider({ children }: HabitsProviderProps) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to habits updates
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = habitService.subscribeToHabits(
      user.uid,
      (updatedHabits) => {
        setHabits(updatedHabits);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [user]);

  /**
   * Manually refresh habits from server
   */
  const refreshHabits = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      const freshHabits = await habitService.getHabits(user.uid);
      setHabits(freshHabits);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to refresh habits';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new habit
   */
  const createHabit = async (input: HabitInput): Promise<Habit> => {
    if (!user) {
      throw new Error('You must be logged in to create a habit');
    }

    try {
      setError(null);
      const habit = await habitService.createHabit(user.uid, input);

      // optimistic update to the UI by adding the new habit to the list
      setHabits((prev) => [habit, ...prev]);

      return habit;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create habit';
      setError(message);
      throw new Error(message);
    }
  };

  /**
   * Update an existing habit
   */
  const updateHabit = async (
    id: string,
    updates: Partial<HabitInput>
  ): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to update habits');
    }

    try {
      setError(null);

      // Optimistic update - update local state immediately
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === id
            ? { ...habit, ...updates, updatedAt: new Date() }
            : habit
        )
      );

      await habitService.updateHabit(user.uid, id, updates);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update habit';
      setError(message);

      // Rollback on error - refresh from server
      await refreshHabits();

      throw new Error(message);
    }
  };

  /**
   * Delete a habit
   */
  const deleteHabit = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to delete a habit');
    }

    try {
      setError(null);

      // Optimistic update - remove from local state immediately
      setHabits((prev) => prev.filter((habit) => habit.id !== id));

      await habitService.deleteHabit(user.uid, id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete habit';
      setError(message);

      // Rollback on error - refresh from server
      await refreshHabits();

      throw new Error(message);
    }
  };

  /**
   * Toggle habit completion for today
   */
  const toggleCompletion = async (id: string, date: string): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to track a habit');
    }

    try {
      setError(null);

      // Optimistic update - toggle completion in local state immediately
      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id !== id) return habit;

          const isCompleted = habit.completedDates.includes(date);
          const newCompletedDates = isCompleted
            ? habit.completedDates.filter((d) => d !== date)
            : [...habit.completedDates, date];

          return { ...habit, completedDates: newCompletedDates };
        })
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update habit completion';
      setError(message);

      // Rollback on error - refresh from server
      await refreshHabits();

      throw new Error(message);
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  const value: HabitsContextType = {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    refreshHabits,
    clearError,
  };

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}

/**
 * Custom hook to use habits context
 * Must be used within HabitsProvider
 */
export function useHabits(): HabitsContextType {
  const context = useContext(HabitsContext);

  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }

  return context;
}
