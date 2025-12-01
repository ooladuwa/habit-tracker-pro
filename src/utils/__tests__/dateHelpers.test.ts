import {
  getTodayString,
  formatDateToString,
  getPreviousDate,
  getDateDaysAgo,
} from '../dateHelpers';

describe('dateHelpers', () => {
  // Test constants
  const TEST_TODAY = '2024-01-15';
  const TEST_TODAY_DATE = new Date('2024-01-15T12:00:00.000Z');
  const TEST_YESTERDAY = '2024-01-14';
  const TEST_ONE_WEEK_AGO = '2024-01-08';
  const TEST_YEAR_END = new Date('2023-12-31T12:00:00.000Z');
  const TEST_YEAR_START = new Date('2024-01-01T12:00:00.000Z');
  const TEST_MARCH_FIRST = '2024-03-01';
  const TEST_FEB_TWENTYNINE = '2024-02-29'; // Leap year
  const TEST_JAN_FIRST = '2024-01-01';
  const TEST_DEC_THIRTYONE = '2023-12-31';

  beforeEach(() => {
    // Mock date to TEST_TODAY
    jest.useFakeTimers();
    jest.setSystemTime(TEST_TODAY_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // GET TODAY STRING TEST
  describe('getTodayString', () => {
    it('should return today in YYYY-MM-DD format', () => {
      const result = getTodayString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result).toBe(TEST_TODAY);
    });
  });

  // FORMAT DATE TO STRING TEST
  describe('formatDateToString', () => {
    it('should format Date object to YYYY-MM-DD', () => {
      const date = new Date('2024-03-20T12:00:00.000Z');
      const result = formatDateToString(date);
      expect(result).toBe('2024-03-20');
    });

    it('should handle year boundary dates correctly', () => {
      // Use explicit times to avoid timezone issues
      expect(formatDateToString(TEST_YEAR_END)).toBe('2023-12-31');
      expect(formatDateToString(TEST_YEAR_START)).toBe('2024-01-01');
    });
  });

  // GET PREVIOUS DATE TEST
  describe('getPreviousDate', () => {
    it('should return previous day for daily frequency', () => {
      const result = getPreviousDate(TEST_TODAY, 'daily');
      expect(result).toBe(TEST_YESTERDAY);
    });

    it('should return previous week for weekly frequency', () => {
      const result = getPreviousDate(TEST_TODAY, 'weekly');
      expect(result).toBe(TEST_ONE_WEEK_AGO);
    });

    it('should handle month boundaries correctly (leap year)', () => {
      const result = getPreviousDate(TEST_MARCH_FIRST, 'daily');
      expect(result).toBe(TEST_FEB_TWENTYNINE);
    });

    it('should handle year boundaries correctly', () => {
      const result = getPreviousDate(TEST_JAN_FIRST, 'daily');
      expect(result).toBe(TEST_DEC_THIRTYONE);
    });
  });

  // GET DATE DAYS AGO TEST
  describe('getDateDaysAgo', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns today when daysAgo is 0', () => {
      expect(getDateDaysAgo(0)).toBe('2024-01-15');
    });

    it('returns correct date N days ago', () => {
      expect(getDateDaysAgo(7)).toBe('2024-01-08');
      expect(getDateDaysAgo(30)).toBe('2023-12-16');
    });

    it('returns correct YYYY-MM-DD format', () => {
      const result = getDateDaysAgo(5);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('handles year boundaries correctly', () => {
      jest.setSystemTime(new Date('2024-01-05T12:00:00Z'));
      expect(getDateDaysAgo(10)).toBe('2023-12-26');
    });

    it('matches getTodayString when daysAgo is 0', () => {
      expect(getDateDaysAgo(0)).toBe(getTodayString());
    });
  });
});
