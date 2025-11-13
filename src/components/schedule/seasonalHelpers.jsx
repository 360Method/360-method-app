import { format, parseISO, isBefore } from 'date-fns';

/**
 * Check if current month falls within a seasonal window
 * @param {string} window - e.g., "September-November", "Spring", "Q1", "Every 3 months"
 * @returns {boolean}
 */
export function isInSeasonalWindow(window) {
  if (!window) return false;
  
  const currentMonth = new Date().getMonth(); // 0-11
  const currentMonthName = format(new Date(), 'MMMM'); // "January", "February", etc.
  
  const windowLower = window.toLowerCase();
  
  // Handle month ranges (e.g., "September-November")
  if (windowLower.includes('-')) {
    const [startMonth, endMonth] = windowLower.split('-').map(m => m.trim());
    
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    const startIdx = monthNames.findIndex(m => m.startsWith(startMonth.toLowerCase()));
    const endIdx = monthNames.findIndex(m => m.startsWith(endMonth.toLowerCase()));
    
    if (startIdx !== -1 && endIdx !== -1) {
      // Handle wrap-around (e.g., "November-February")
      if (startIdx <= endIdx) {
        return currentMonth >= startIdx && currentMonth <= endIdx;
      } else {
        return currentMonth >= startIdx || currentMonth <= endIdx;
      }
    }
  }
  
  // Handle seasons
  const seasonMap = {
    'spring': [2, 3, 4], // March, April, May
    'summer': [5, 6, 7], // June, July, August
    'fall': [8, 9, 10],  // September, October, November
    'autumn': [8, 9, 10],
    'winter': [11, 0, 1] // December, January, February
  };
  
  for (const [season, months] of Object.entries(seasonMap)) {
    if (windowLower.includes(season)) {
      return months.includes(currentMonth);
    }
  }
  
  // Handle quarters
  const quarterMap = {
    'q1': [0, 1, 2],   // Jan, Feb, Mar
    'q2': [3, 4, 5],   // Apr, May, Jun
    'q3': [6, 7, 8],   // Jul, Aug, Sep
    'q4': [9, 10, 11]  // Oct, Nov, Dec
  };
  
  for (const [quarter, months] of Object.entries(quarterMap)) {
    if (windowLower === quarter) {
      return months.includes(currentMonth);
    }
  }
  
  // Handle "Every X months" - always show (user manages with snooze)
  if (windowLower.includes('every')) {
    return true;
  }
  
  // Handle specific month names
  if (windowLower.includes(currentMonthName.toLowerCase())) {
    return true;
  }
  
  return false;
}

/**
 * Check if task should show in seasonal reminders
 * @param {object} task - MaintenanceTask entity
 * @returns {boolean}
 */
export function shouldShowSeasonalReminder(task) {
  // Must be seasonal task
  if (!task.seasonal) return false;
  
  // Must not be scheduled yet
  if (task.scheduled_date) return false;
  
  // Must be in Identified status (not Deferred, Completed, etc.)
  if (task.status !== 'Identified') return false;
  
  // Check if snoozed
  if (task.reminder_snoozed_until) {
    try {
      const snoozeDate = parseISO(task.reminder_snoozed_until);
      if (isBefore(new Date(), snoozeDate)) return false;
    } catch {
      // Invalid date format, ignore
    }
  }
  
  // Check if in seasonal window
  if (!isInSeasonalWindow(task.recommended_completion_window)) return false;
  
  return true;
}

/**
 * Get seasonal emoji for current month
 * @returns {string}
 */
export function getSeasonalEmoji() {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return '🌸'; // Spring
  if (month >= 5 && month <= 7) return '☀️'; // Summer
  if (month >= 8 && month <= 10) return '🍂'; // Fall
  return '❄️'; // Winter
}