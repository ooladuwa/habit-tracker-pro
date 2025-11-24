import { subDays } from 'date-fns';
import {
  getTodayString,
  getPreviousDate,
  formatDateToString,
} from './dateHelpers';

/**
 * Streak Calculator Utility
 * Calculates current streaks and completion statistics
 */

/**
 * Calculate the current streak for a habit
 * A streak is consecutive days (or weeks) where the habit was completed
 * @param completedDates - Array of date strings in YYYY-MM-DD format
 * @param frequency - The frequency of the habit (daily, weekly)
 * @returns The current streak
 */
export const calculateStreak = (
  completedDates: string[],
  frequency: 'daily' | 'weekly'
): number => {
  // No completed dates, no streak
  if (completedDates.length === 0) return 0;

  // sort completed dates in descending order
  const sortedDates = [...completedDates].sort((a, b) => b.localeCompare(a));

  // Initialize streak counter
  let streak = 0;

  // get date to check against
  let checkDate = getTodayString();

  // loop through sorted dates and calculate streak
  for (const completedDate of sortedDates) {
    // check if this date matches the expected date
    if (completedDate === checkDate) {
      streak++;
      // update check date for next iteration
      checkDate = getPreviousDate(checkDate, frequency);
    } else if (completedDate < checkDate) {
      // gap found, break the streak
      break;
    }
    // if completed date is greater than check date, continue to next date
  }
  return streak;
};

/**
 * Check if a habit was completed today
 * @param completedDates - Array of date strings in YYYY-MM-DD format
 * @returns True if the habit was completed today, false otherwise
 */
export const isCompletedToday = (completedDates: string[]): boolean => {
  return completedDates.includes(getTodayString());
};

/**
 * Get total completion count for a habit
 * @param completedDates - Array of date strings in YYYY-MM-DD format
 * @returns The total number of times the habit was completed
 */
export const getTotalCompletions = (completedDates: string[]): number => {
  return completedDates.length;
};

/**
 * Get the completion percentage
 * Uses direct date-fns call + string comparisons for performance
 * @param completedDates - Array of date strings in YYYY-MM-DD format
 * @param frequency - The frequency of the habit (daily, weekly)
 * @returns The completion percentage as a number between 0 and 100
 */
export const getCompletionRate = (
  completedDates: string[],
  frequency: 'daily' | 'weekly'
): number => {
  // use date-fns directly for one-off calculation
  const thirtyDaysAgo = formatDateToString(subDays(new Date(), 30));

  // filter completed dates to only include those in the last 30 days
  const recentCompletions = completedDates.filter(
    (dateStr) => dateStr >= thirtyDaysAgo
  );

  const expectedDays = frequency === 'daily' ? 30 : 4;
  const completionRate = (recentCompletions.length / expectedDays) * 100;

  return Math.min(Math.round(completionRate), 100);
};

/**
 * Format streak data for display
 * @param streak - The current streak
 * @param frequency - The frequency of the habit (daily, weekly)
 * @returns The formatted streak data
 */
export const formatStreak = (
  streak: number,
  frequency: 'daily' | 'weekly'
): string => {
  // no streak yet
  if (streak === 0) return 'No streak yet';

  // format the streak with the correct unit
  const unit = frequency === 'daily' ? 'day' : 'week';

  // return the formatted streak
  return `${streak} ${unit}${streak === 1 ? '' : 's'}`;
};
