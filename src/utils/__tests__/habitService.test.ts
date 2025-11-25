import * as habitService from '../../services/habitService';
import * as firestore from 'firebase/firestore';
import type {
  DocumentReference,
  UpdateData,
  QuerySnapshot,
} from 'firebase/firestore';
import type { HabitDocument } from '../../types';

// Mock Firestore functions
jest.mock('firebase/firestore');

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
const mockQuery = firestore.query as jest.MockedFunction<
  typeof firestore.query
>;
const mockCollection = firestore.collection as jest.MockedFunction<
  typeof firestore.collection
>;
const mockWhere = firestore.where as jest.MockedFunction<
  typeof firestore.where
>;
const mockDoc = firestore.doc as jest.MockedFunction<typeof firestore.doc>;

describe('habitService', () => {
  // Test constants
  const TEST_USER_ID = 'test-user-123';
  const TEST_HABIT_ID = 'habit-123';
  const TEST_TODAY = '2024-01-15';
  const DATES_WITHOUT_TODAY = ['2024-01-14', '2024-01-13', '2024-01-12'];
  const DATES_WITH_TODAY = ['2024-01-14', TEST_TODAY];

  const MOCK_HABIT_DOC_REF = { id: TEST_HABIT_ID };

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
    frequency: 'weekly' as const,
    color: '#00A8E8',
    icon: 'meditation',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks for Firestore query chain
    mockCollection.mockReturnValue({} as any);
    mockDoc.mockReturnValue({ id: TEST_HABIT_ID } as any);
    mockQuery.mockReturnValue({} as any);
    mockWhere.mockReturnValue({} as any);
  });

  // CREATE HABIT TEST
  describe('createHabit', () => {
    it('should create a habit successfully', async () => {
      mockAddDoc.mockResolvedValue(
        MOCK_HABIT_DOC_REF as unknown as DocumentReference
      );

      const result = await habitService.createHabit(
        TEST_USER_ID,
        TEST_HABIT_INPUT
      );

      expect(result).toMatchObject({
        id: TEST_HABIT_ID,
        title: TEST_HABIT_INPUT.title,
        description: TEST_HABIT_INPUT.description,
        frequency: TEST_HABIT_INPUT.frequency,
      });
      expect(mockAddDoc).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockAddDoc.mockRejectedValue(new Error('Network error'));

      await expect(
        habitService.createHabit(TEST_USER_ID, {
          title: 'Test',
          frequency: 'daily',
        })
      ).rejects.toThrow();
    });
  });

  // UPDATE HABIT TEST
  describe('updateHabit', () => {
    it('should update all habit fields successfully', async () => {
      // Given: User wants to edit their habit
      mockUpdateDoc.mockResolvedValue(undefined);

      // When: User updates all fields
      await habitService.updateHabit(
        TEST_USER_ID,
        TEST_HABIT_ID,
        UPDATED_HABIT_DATA
      );

      // Then: All fields should be updated
      expect(mockUpdateDoc).toHaveBeenCalled();

      const [, updateData] = mockUpdateDoc.mock.calls[0];
      const typedUpdateData = updateData as UpdateData<HabitDocument>;
      expect(typedUpdateData).toMatchObject({
        title: UPDATED_HABIT_DATA.title,
        description: UPDATED_HABIT_DATA.description,
        frequency: UPDATED_HABIT_DATA.frequency,
        color: UPDATED_HABIT_DATA.color,
        icon: UPDATED_HABIT_DATA.icon,
        updatedAt: expect.any(Date),
      });
    });

    it('should update only title when provided', async () => {
      // Given: User wants to update only the title
      const partialUpdate = {
        title: 'Morning Meditation',
      };

      mockUpdateDoc.mockResolvedValue(undefined);

      // When: User updates only the title
      await habitService.updateHabit(
        TEST_USER_ID,
        TEST_HABIT_ID,
        partialUpdate
      );

      // Then: Only title and updatedAt should be in the update
      expect(mockUpdateDoc).toHaveBeenCalled();

      const [, updateData] = mockUpdateDoc.mock.calls[0];
      const typedUpdateData = updateData as UpdateData<HabitDocument>;
      expect(typedUpdateData.title).toBe(partialUpdate.title);
      expect(typedUpdateData.updatedAt).toBeDefined();
    });

    it('should update frequency and color together', async () => {
      // Given: User wants to change frequency and color
      const partialUpdate = {
        frequency: 'weekly' as const,
        color: '#8B5CF6',
      };

      mockUpdateDoc.mockResolvedValue(undefined);

      // When: User updates frequency and color
      await habitService.updateHabit(
        TEST_USER_ID,
        TEST_HABIT_ID,
        partialUpdate
      );

      // Then: Both fields should be updated
      expect(mockUpdateDoc).toHaveBeenCalled();

      const [, updateData] = mockUpdateDoc.mock.calls[0];
      const typedUpdateData = updateData as UpdateData<HabitDocument>;
      expect(typedUpdateData).toMatchObject({
        frequency: partialUpdate.frequency,
        color: partialUpdate.color,
        updatedAt: expect.any(Date),
      });
    });

    it('should handle errors gracefully', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Permission denied'));

      await expect(
        habitService.updateHabit(
          TEST_USER_ID,
          TEST_HABIT_ID,
          UPDATED_HABIT_DATA
        )
      ).rejects.toThrow('Failed to update habit');
    });
  });

  // TOGGLE COMPLETION TEST
  describe('toggleHabitCompletion', () => {
    it('should complete habit when user checks empty checkbox', async () => {
      // Given: User sees an unchecked checkbox (habit not done today)
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: TEST_HABIT_ID,
            data: () => ({
              id: TEST_HABIT_ID,
              userId: TEST_USER_ID,
              title: 'Morning Yoga',
              completedDates: DATES_WITHOUT_TODAY,
            }),
          },
        ],
      } as unknown as QuerySnapshot);

      mockUpdateDoc.mockResolvedValue(undefined);

      // When: User clicks the checkbox to complete it
      await habitService.toggleHabitCompletion(
        TEST_USER_ID,
        TEST_HABIT_ID,
        TEST_TODAY
      );

      // Then: updateDoc was called
      expect(mockUpdateDoc).toHaveBeenCalled();

      // Verify the update includes today's date
      const [, updateData] = mockUpdateDoc.mock.calls[0];
      const typedUpdateData = updateData as UpdateData<HabitDocument>;
      expect(typedUpdateData.completedDates).toContain(TEST_TODAY);
      expect(typedUpdateData.updatedAt).toBeDefined();
    });

    it('should uncomplete habit when user unchecks filled checkbox', async () => {
      // Given: User sees a checked checkbox (habit done today)
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: TEST_HABIT_ID,
            data: () => ({
              id: TEST_HABIT_ID,
              userId: TEST_USER_ID,
              title: 'Morning Yoga',
              completedDates: DATES_WITH_TODAY,
            }),
          },
        ],
      } as unknown as QuerySnapshot);

      // When: User clicks the checkbox again to uncomplete it
      await habitService.toggleHabitCompletion(
        TEST_USER_ID,
        TEST_HABIT_ID,
        TEST_TODAY
      );

      // Then: updateDoc was called
      expect(mockUpdateDoc).toHaveBeenCalled();

      // Verify today's date was removed
      const [, updateData] = mockUpdateDoc.mock.calls[0];
      const typedUpdateData = updateData as UpdateData<HabitDocument>;
      expect(typedUpdateData.completedDates).not.toContain(TEST_TODAY);
      expect(typedUpdateData.updatedAt).toBeDefined();
    });
  });

  // DELETE HABIT TEST
  describe('deleteHabit', () => {
    it('should delete a habit successfully', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await habitService.deleteHabit(TEST_USER_ID, TEST_HABIT_ID);

      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });
});
