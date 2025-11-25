import React, { type RefObject } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useHabits, HabitsProvider } from '../../hooks/useHabits';
import * as habitService from '../../services/habitService';
import type { HabitsContextType } from '../../types';

// Mock the habitService
jest.mock('../../services/habitService');

// Mock useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', email: 'test@test.com' },
    loading: false,
    error: null,
  }),
}));

describe('useHabits', () => {
  // TEST CONSTANTS
  const TEST_USER_ID = 'test-user-123';
  const TEST_HABIT_ID = 'habit-123';
  const TEST_TODAY = '2024-01-15';

  const MOCK_HABIT = {
    id: TEST_HABIT_ID,
    userId: TEST_USER_ID,
    title: 'Morning Yoga',
    description: '20 minutes',
    frequency: 'daily' as const,
    color: '#FF6B35',
    icon: 'yoga',
    completedDates: [],
    createdAt: new Date('2024-01-01T12:00:00.000Z'),
    updatedAt: new Date('2024-01-01T12:00:00.000Z'),
  };

  const MOCK_HABIT_INPUT = {
    title: 'Morning Yoga',
    description: '20 minutes',
    frequency: 'daily' as const,
    color: '#FF6B35',
    icon: 'yoga',
  };

  const UPDATED_HABIT_DATA = {
    title: 'Evening Yoga',
    description: '30 minutes',
  };

  // SETUP
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for subscribeToHabits (returns empty array)
    (habitService.subscribeToHabits as jest.Mock).mockImplementation(
      (_, callback) => {
        callback([]);
        return jest.fn();
      }
    );
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <HabitsProvider>{children}</HabitsProvider>
  );

  // HELPER FUNCTIONS
  /**
   * Setup mock to return habits via subscription
   */
  const setupHabitsSubscription = (habits = [MOCK_HABIT]) => {
    (habitService.subscribeToHabits as jest.Mock).mockImplementation(
      (_, callback) => {
        callback(habits);
        return jest.fn();
      }
    );
  };

  /**
   * Render hook and wait for loading to complete
   */
  const renderHabitsHook = async () => {
    const { result } = renderHook(() => useHabits(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    return result;
  };

  /**
   * Render hook with habits loaded
   */
  const renderWithHabits = async (habits = [MOCK_HABIT]) => {
    setupHabitsSubscription(habits);
    const result = await renderHabitsHook();

    await waitFor(() => {
      expect(result.current.habits).toHaveLength(habits.length);
    });

    return result;
  };

  /**
   * Generic error handler test helper.
   * Tests that operations properly catch errors and set error state
   */
  const testErrorHandling = async (
    mockFn: jest.Mock,
    operation: (result: RefObject<HabitsContextType>) => Promise<void>,
    errorMessage = 'Test error'
  ) => {
    const mockHabits = [MOCK_HABIT];
    setupHabitsSubscription(mockHabits);

    mockFn.mockRejectedValue(new Error(errorMessage));

    const result = await renderWithHabits(mockHabits);

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
  };

  // TESTS
  /**
   * Tests that the hook initializes with empty habits and no error
   */
  describe('initialization', () => {
    it('should initialize with empty habits', async () => {
      const result = await renderHabitsHook();

      expect(result.current.habits).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should load habits from subscription', async () => {
      const result = await renderWithHabits([MOCK_HABIT]);

      expect(result.current.habits[0]).toMatchObject({
        id: TEST_HABIT_ID,
        title: 'Morning Yoga',
      });
    });
  });

  /**
   * Tests that a habit can be created successfully
   */
  describe('createHabit', () => {
    it('should create a habit successfully', async () => {
      (habitService.createHabit as jest.Mock).mockResolvedValue(MOCK_HABIT);

      const result = await renderHabitsHook();

      await act(async () => {
        await result.current.createHabit(MOCK_HABIT_INPUT);
      });

      expect(habitService.createHabit).toHaveBeenCalledWith(
        TEST_USER_ID,
        expect.objectContaining({
          title: 'Morning Yoga',
          frequency: 'daily',
        })
      );
    });

    it('should handle create errors gracefully', async () => {
      await testErrorHandling(
        habitService.createHabit as jest.Mock,
        async (result) => {
          await result.current.createHabit(MOCK_HABIT_INPUT);
        }
      );
    });
  });

  /**
   * Tests that a habit can be updated successfully
   */
  describe('updateHabit', () => {
    it('should update a habit successfully', async () => {
      (habitService.updateHabit as jest.Mock).mockResolvedValue(undefined);

      const result = await renderWithHabits();

      await act(async () => {
        await result.current.updateHabit(TEST_HABIT_ID, UPDATED_HABIT_DATA);
      });

      expect(habitService.updateHabit).toHaveBeenCalledWith(
        TEST_USER_ID,
        TEST_HABIT_ID,
        UPDATED_HABIT_DATA
      );
    });

    it('should handle update errors gracefully', async () => {
      await testErrorHandling(
        habitService.updateHabit as jest.Mock,
        async (result) => {
          await result.current.updateHabit(TEST_HABIT_ID, UPDATED_HABIT_DATA);
        },
        'Permission denied'
      );
    });
  });

  /**
   * Tests that a habit completion can be toggled successfully
   */
  describe('toggleCompletion', () => {
    it('should toggle habit completion successfully', async () => {
      (habitService.toggleHabitCompletion as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await renderWithHabits();

      await act(async () => {
        await result.current.toggleCompletion(TEST_HABIT_ID, TEST_TODAY);
      });

      expect(habitService.toggleHabitCompletion).toHaveBeenCalledWith(
        TEST_USER_ID,
        TEST_HABIT_ID,
        TEST_TODAY
      );
    });

    it('should handle toggle errors gracefully', async () => {
      await testErrorHandling(
        habitService.toggleHabitCompletion as jest.Mock,
        async (result) => {
          await result.current.toggleCompletion(TEST_HABIT_ID, TEST_TODAY);
        },
        'Failed to toggle'
      );
    });
  });

  /**
   * Tests that a habit can be deleted successfully
   */
  describe('deleteHabit', () => {
    it('should delete a habit successfully', async () => {
      (habitService.deleteHabit as jest.Mock).mockResolvedValue(undefined);

      const result = await renderWithHabits();

      await act(async () => {
        await result.current.deleteHabit(TEST_HABIT_ID);
      });

      expect(habitService.deleteHabit).toHaveBeenCalledWith(
        TEST_USER_ID,
        TEST_HABIT_ID
      );
    });

    it('should handle delete errors gracefully', async () => {
      await testErrorHandling(
        habitService.deleteHabit as jest.Mock,
        async (result) => {
          await result.current.deleteHabit(TEST_HABIT_ID);
        },
        'Failed to delete'
      );
    });
  });
});
