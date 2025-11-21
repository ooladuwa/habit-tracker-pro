import { format, subDays, subWeeks, parseISO } from 'date-fns';

/**
 * Date Helper Functions
 * @description Uses date-fns for reliable, tested date handling
 */

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Format a date object to YYYY-MM-DD format
 * @param date - The date object to format
 * @returns The date in YYYY-MM-DD format
 */
export const formatDateToString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Get the previous date (for streak calculation)
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param frequency - The frequency of the habit (daily, weekly)
 * @returns The previous date in YYYY-MM-DD format
 */
export const getPreviousDate = (
  dateStr: string,
  frequency: 'daily' | 'weekly'
): string => {
  const date = parseISO(dateStr);
  const previousDate =
    frequency === 'daily' ? subDays(date, 1) : subWeeks(date, 1);
  return formatDateToString(previousDate);
};
