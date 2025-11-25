import {
  calculateStreak,
  isCompletedToday,
  getTotalCompletions,
  getCompletionRate,
  formatStreak,
} from '../streakCalculator';

describe('streakCalculator', () => {
  // Test constants
  const TEST_TODAY = '2024-01-15';
  const TEST_TODAY_DATE = new Date('2024-01-15T12:00:00.000Z');

  // Date sequences for various test scenarios
  const DATES_WITH_THREE_DAY_STREAK = [
    '2024-01-15', // today
    '2024-01-14',
    '2024-01-13',
  ];

  const DATES_WITH_THREE_WEEK_STREAK = [
    '2024-01-15', // today
    '2024-01-08', // 1 week ago
    '2024-01-01', // 2 weeks ago
  ];

  const DATES_WITH_GAP = [
    '2024-01-15', // today
    '2024-01-14',
    // gap here
    '2024-01-12',
    '2024-01-11',
  ];

  const DATES_UNSORTED = [
    '2024-01-13',
    '2024-01-15', // today
    '2024-01-14',
  ];

  const DATES_WITHOUT_TODAY = ['2024-01-14', '2024-01-13', '2024-01-12'];

  const DATES_WITH_TODAY = ['2024-01-14', TEST_TODAY];
  const DATES_WITHOUT_TODAY_TWO = ['2024-01-14', '2024-01-13'];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(TEST_TODAY_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('calculateStreak', () => {
    it('should return 0 for empty completedDates', () => {
      const result = calculateStreak([], 'daily');
      expect(result).toBe(0);
    });

    it('should calculate daily streak correctly', () => {
      const result = calculateStreak(DATES_WITH_THREE_DAY_STREAK, 'daily');
      expect(result).toBe(3);
    });

    it('should calculate weekly streak correctly', () => {
      const result = calculateStreak(DATES_WITH_THREE_WEEK_STREAK, 'weekly');
      expect(result).toBe(3);
    });

    it('should stop counting at first gap', () => {
      const result = calculateStreak(DATES_WITH_GAP, 'daily');
      expect(result).toBe(2); // Only counts 15th and 14th
    });

    it('should handle unsorted dates', () => {
      const result = calculateStreak(DATES_UNSORTED, 'daily');
      expect(result).toBe(3);
    });

    it('should return 0 if not completed today', () => {
      const result = calculateStreak(DATES_WITHOUT_TODAY, 'daily');
      expect(result).toBe(0);
    });
  });

  describe('isCompletedToday', () => {
    it('should return true if completed today', () => {
      expect(isCompletedToday(DATES_WITH_TODAY)).toBe(true);
    });

    it('should return false if not completed today', () => {
      expect(isCompletedToday(DATES_WITHOUT_TODAY_TWO)).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(isCompletedToday([])).toBe(false);
    });
  });

  describe('getTotalCompletions', () => {
    it('should return count of completions', () => {
      expect(getTotalCompletions(DATES_WITH_THREE_DAY_STREAK)).toBe(3);
    });

    it('should return 0 for empty array', () => {
      expect(getTotalCompletions([])).toBe(0);
    });
  });

  describe('getCompletionRate', () => {
    it('should calculate completion rate correctly', () => {
      // 3 completions out of 30 days = 10%
      const result = getCompletionRate(DATES_WITH_THREE_DAY_STREAK, 'daily');
      expect(result).toBe(10);
    });

    it('should cap at 100%', () => {
      // Generate 40 dates (more than 30 days)
      // Using setDate() is safe here as we're generating a sequence
      const manyDates = Array.from({ length: 40 }, (_, i) => {
        const date = new Date(TEST_TODAY_DATE);
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      });

      const result = getCompletionRate(manyDates, 'daily');
      expect(result).toBe(100);
    });
  });

  describe('formatStreak', () => {
    const STREAK_ZERO = 0;
    const STREAK_ONE = 1;
    const STREAK_FIVE = 5;
    const STREAK_THREE = 3;

    it('should format 0 streak correctly', () => {
      expect(formatStreak(STREAK_ZERO, 'daily')).toBe('No streak yet');
    });

    it('should format 1 day streak correctly', () => {
      expect(formatStreak(STREAK_ONE, 'daily')).toBe('1 day');
    });

    it('should format multiple day streak correctly', () => {
      expect(formatStreak(STREAK_FIVE, 'daily')).toBe('5 days');
    });

    it('should format 1 week streak correctly', () => {
      expect(formatStreak(STREAK_ONE, 'weekly')).toBe('1 week');
    });

    it('should format multiple week streak correctly', () => {
      expect(formatStreak(STREAK_THREE, 'weekly')).toBe('3 weeks');
    });
  });
});
