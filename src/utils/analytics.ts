import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analytics } from '../config/firebaseConfig';

/**
 * Track an analytics event
 * Logs to console in development, sends to Firebase in production
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  // Always log to console in development
  if (__DEV__) {
    console.log(`📊 Analytics: ${eventName}`, params || '');
  }

  // Send to Firebase Analytics if available
  try {
    if (analytics) {
      firebaseLogEvent(analytics, eventName, params);
    }
  } catch (error) {
    console.warn('Analytics error:', error);
  }
};

/**
 * Track a screen view
 */
export const trackScreenView = (screenName: string) => {
  trackEvent('screen_view', { screen_name: screenName });
};
