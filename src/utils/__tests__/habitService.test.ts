import * as habitService from '../../services/habitService';
import * as firestore from 'firebase/firestore';
import type {
  DocumentReference,
  UpdateData,
  QuerySnapshot,
} from 'firebase/firestore';
import type { HabitDocument } from '../../types';

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(() => ({ _methodName: 'serverTimestamp' })),
}));

const mockAddDoc = firestore.addDoc as jest.MockedFunction<
  typeof firestore.addDoc
>;
const mockGetDocs = firestore.getDocs as jest.MockedFunction<
  typeof firestore.getDocs
>;
const mockUpdateDoc = firestore.updateDoc as jest.MockedFunction<
  typeof firestore.updateDoc
>;
const mockDeleteDoc = firestore.deleteDoc as jest.MockedFunction<
  typeof firestore.deleteDoc
>;

describe('habitService', () => {
  // TEST CONSTANTS
  const TEST_USER_ID = 'test-user-123';
  const TEST_HABIT_ID = 'habit-123';
  const TEST_TODAY = '2024-01-15';
  const DATES_WITHOUT_TODAY = ['2024-01-14', '2024-01-13', '2024-01-12'];
  const DATES_WITH_TODAY = ['2024-01-14', TEST_TODAY];

  const TEST_HABIT_INPUT = {
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

  // HELPER FUNCTIONS

  /**
   * Creates a mock Firestore habit document.
   * Uses ISO string dates to avoid Timestamp complexity in tests.
   */
  const createMockHabitDoc = (overrides: Partial<HabitDocument> = {}) => ({
    id: TEST_HABIT_ID,
    data: () => ({
      userId: TEST_USER_ID,
      ...TEST_HABIT_INPUT,
      completedDates: [],
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date('2024-01-01').toISOString(),
      ...overrides,
    }),
  });

  /**
   * Mocks getDocs to return habits successfully
   */
  const mockGetDocsSuccess = (habits = [createMockHabitDoc()]) => {
    mockGetDocs.mockResolvedValue({
      empty: false,
      docs: habits,
    } as unknown as QuerySnapshot);
  };

  /**
   * Mocks getDocs to return empty (no habits)
   */
  const mockGetDocsEmpty = () => {
    mockGetDocs.mockResolvedValue({
      empty: true,
      docs: [],
    } as unknown as QuerySnapshot);
  };

  /**
   * Extracts update data from mockUpdateDoc call
   */
  const getUpdateData = () => {
    const [, updateData] = mockUpdateDoc.mock.calls[0];
    return updateData as UpdateData<HabitDocument>;
  };

  /**
   * Generic error handler test helper
   */
  const testErrorHandling = async (
    mockFn: { mockRejectedValue: (value: unknown) => void },
    operation: () => Promise<unknown>,
    expectedErrorMessage: string
  ) => {
    mockFn.mockRejectedValue(new Error('Firestore error'));
    await expect(operation()).rejects.toThrow(expectedErrorMessage);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TESTS

  describe('createHabit', () => {
    it('should create a habit successfully', async () => {
      mockAddDoc.mockResolvedValue({
        id: TEST_HABIT_ID,
      } as unknown as DocumentReference);

      const result = await habitService.createHabit(
        TEST_USER_ID,
        TEST_HABIT_INPUT
      );

      expect(mockAddDoc).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: TEST_HABIT_ID,
        title: TEST_HABIT_INPUT.title,
        description: TEST_HABIT_INPUT.description,
        frequency: TEST_HABIT_INPUT.frequency,
      });
    });

    it('should handle errors gracefully', async () => {
      await testErrorHandling(
        mockAddDoc,
        () => habitService.createHabit(TEST_USER_ID, TEST_HABIT_INPUT),
        'Failed to create habit'
      );
    });
  });

  describe('updateHabit', () => {
    it('should update all habit fields successfully', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await habitService.updateHabit(
        TEST_USER_ID,
        TEST_HABIT_ID,
        UPDATED_HABIT_DATA
      );

      expect(mockUpdateDoc).toHaveBeenCalled();

      const updateData = getUpdateData();
      expect(updateData).toMatchObject({
        title: UPDATED_HABIT_DATA.title,
        description: UPDATED_HABIT_DATA.description,
      });
      expect(updateData.updatedAt).toBeDefined();
    });

    it('should support partial updates', async () => {
      const partialUpdate = { title: 'Morning Meditation' };
      mockUpdateDoc.mockResolvedValue(undefined);

      await habitService.updateHabit(
        TEST_USER_ID,
        TEST_HABIT_ID,
        partialUpdate
      );

      const updateData = getUpdateData();
      expect(updateData.title).toBe(partialUpdate.title);
      expect(updateData.updatedAt).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      await testErrorHandling(
        mockUpdateDoc,
        () =>
          habitService.updateHabit(
            TEST_USER_ID,
            TEST_HABIT_ID,
            UPDATED_HABIT_DATA
          ),
        'Failed to update habit'
      );
    });
  });

  describe('toggleHabitCompletion', () => {
    it('should complete habit when not already completed', async () => {
      mockGetDocsSuccess([
        createMockHabitDoc({ completedDates: DATES_WITHOUT_TODAY }),
      ]);
      mockUpdateDoc.mockResolvedValue(undefined);

      await habitService.toggleHabitCompletion(
        TEST_USER_ID,
        TEST_HABIT_ID,
        TEST_TODAY
      );

      expect(mockUpdateDoc).toHaveBeenCalled();

      const updateData = getUpdateData();
      expect(updateData.completedDates).toContain(TEST_TODAY);
    });

    it('should uncomplete habit when already completed', async () => {
      mockGetDocsSuccess([
        createMockHabitDoc({ completedDates: DATES_WITH_TODAY }),
      ]);
      mockUpdateDoc.mockResolvedValue(undefined);

      await habitService.toggleHabitCompletion(
        TEST_USER_ID,
        TEST_HABIT_ID,
        TEST_TODAY
      );

      const updateData = getUpdateData();
      expect(updateData.completedDates).not.toContain(TEST_TODAY);
    });

    it('should handle habit not found error', async () => {
      mockGetDocsEmpty();

      await expect(
        habitService.toggleHabitCompletion(
          TEST_USER_ID,
          TEST_HABIT_ID,
          TEST_TODAY
        )
      ).rejects.toThrow('Failed to toggle habit completion');
    });

    it('should preserve other completed dates when toggling', async () => {
      const existingDates = ['2024-01-10', '2024-01-11', '2024-01-12'];
      mockGetDocsSuccess([
        createMockHabitDoc({ completedDates: existingDates }),
      ]);
      mockUpdateDoc.mockResolvedValue(undefined);

      await habitService.toggleHabitCompletion(
        TEST_USER_ID,
        TEST_HABIT_ID,
        TEST_TODAY
      );

      const updateData = getUpdateData();
      expect(updateData.completedDates).toHaveLength(4);
      expect(updateData.completedDates).toContain(TEST_TODAY);
      expect(updateData.completedDates).toEqual(
        expect.arrayContaining(existingDates)
      );
    });
  });

  describe('deleteHabit', () => {
    it('should delete a habit successfully', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await habitService.deleteHabit(TEST_USER_ID, TEST_HABIT_ID);

      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      await testErrorHandling(
        mockDeleteDoc,
        () => habitService.deleteHabit(TEST_USER_ID, TEST_HABIT_ID),
        'Failed to delete habit'
      );
    });
  });

  describe('getHabits', () => {
    it('should fetch all habits for user', async () => {
      mockGetDocsSuccess([createMockHabitDoc()]);

      const result = await habitService.getHabits(TEST_USER_ID);

      expect(mockGetDocs).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: TEST_HABIT_ID,
        title: 'Morning Yoga',
        userId: TEST_USER_ID,
      });
    });

    it('should return empty array when user has no habits', async () => {
      mockGetDocsEmpty();

      const result = await habitService.getHabits(TEST_USER_ID);

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      await testErrorHandling(
        mockGetDocs,
        () => habitService.getHabits(TEST_USER_ID),
        'Failed to get habits'
      );
    });
  });
});
