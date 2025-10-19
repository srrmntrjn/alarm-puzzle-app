/**
 * Format time to 12-hour format with AM/PM
 * @param hour - Hour in 24-hour format (0-23)
 * @param minute - Minute (0-59)
 * @returns Formatted time string (e.g., "4:00 AM", "11:30 PM")
 */
export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  const minuteStr = minute.toString().padStart(2, '0');
  return `${hour12}:${minuteStr} ${period}`;
}

/**
 * Compare two times
 * @returns -1 if time1 < time2, 0 if equal, 1 if time1 > time2
 */
export function compareTimes(
  time1: { hour: number; minute: number },
  time2: { hour: number; minute: number }
): number {
  if (time1.hour !== time2.hour) {
    return time1.hour - time2.hour;
  }
  return time1.minute - time2.minute;
}

/**
 * Format a date to a readable string
 * @param date - ISO date string
 * @returns Formatted date string (e.g., "Today 4:00 AM", "Yesterday 11:30 PM", "Jan 15 4:00 AM")
 */
export function formatTriggerDate(date: string): string {
  const triggerDate = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const triggerDay = new Date(
    triggerDate.getFullYear(),
    triggerDate.getMonth(),
    triggerDate.getDate()
  );

  const time = formatTime(triggerDate.getHours(), triggerDate.getMinutes());

  if (triggerDay.getTime() === today.getTime()) {
    return `Today ${time}`;
  } else if (triggerDay.getTime() === yesterday.getTime()) {
    return `Yesterday ${time}`;
  } else {
    const month = triggerDate.toLocaleDateString('en-US', { month: 'short' });
    const day = triggerDate.getDate();
    return `${month} ${day} ${time}`;
  }
}

/**
 * Calculate next alarm occurrence based on schedule
 * @param time - Alarm time
 * @param schedule - Day schedule
 * @returns Date of next alarm occurrence
 */
export function getNextAlarmTime(
  time: { hour: number; minute: number },
  schedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  }
): Date | null {
  const now = new Date();
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

  // Try up to 7 days ahead
  for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() + daysAhead);
    checkDate.setHours(time.hour, time.minute, 0, 0);

    const dayName = daysOfWeek[checkDate.getDay()];

    // If this day is enabled in schedule and time hasn't passed yet (or it's a future day)
    if (schedule[dayName] && (daysAhead > 0 || checkDate > now)) {
      return checkDate;
    }
  }

  return null;
}
