import { Alarm } from '../types/alarm';

/**
 * Format schedule to a readable string
 * @param schedule - Alarm schedule
 * @returns Formatted schedule string (e.g., "M-F", "Daily", "M W F", "Weekends")
 */
export function formatSchedule(schedule: Alarm['schedule']): string {
  const days = {
    monday: schedule.monday,
    tuesday: schedule.tuesday,
    wednesday: schedule.wednesday,
    thursday: schedule.thursday,
    friday: schedule.friday,
    saturday: schedule.saturday,
    sunday: schedule.sunday,
  };

  const enabledDays = Object.entries(days).filter(([_, enabled]) => enabled);

  // No days selected
  if (enabledDays.length === 0) {
    return 'Never';
  }

  // All days
  if (enabledDays.length === 7) {
    return 'Daily';
  }

  // Weekdays (M-F)
  if (
    schedule.monday &&
    schedule.tuesday &&
    schedule.wednesday &&
    schedule.thursday &&
    schedule.friday &&
    !schedule.saturday &&
    !schedule.sunday
  ) {
    return 'M-F';
  }

  // Weekends
  if (
    !schedule.monday &&
    !schedule.tuesday &&
    !schedule.wednesday &&
    !schedule.thursday &&
    !schedule.friday &&
    schedule.saturday &&
    schedule.sunday
  ) {
    return 'Weekends';
  }

  // Custom schedule - show abbreviated days
  const dayAbbreviations: Record<string, string> = {
    monday: 'M',
    tuesday: 'T',
    wednesday: 'W',
    thursday: 'Th',
    friday: 'F',
    saturday: 'Sa',
    sunday: 'Su',
  };

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const abbreviatedDays = dayOrder
    .filter((day) => schedule[day as keyof Alarm['schedule']])
    .map((day) => dayAbbreviations[day])
    .join(' ');

  return abbreviatedDays;
}

/**
 * Get preset schedule configurations
 */
export const SCHEDULE_PRESETS = {
  weekdays: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  },
  weekends: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: true,
    sunday: true,
  },
  daily: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  },
  never: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  },
};

/**
 * Check if a schedule matches a preset
 */
export function getSchedulePresetName(schedule: Alarm['schedule']): string | null {
  if (
    Object.keys(schedule).every(
      (key) => schedule[key as keyof Alarm['schedule']] === SCHEDULE_PRESETS.weekdays[key as keyof Alarm['schedule']]
    )
  ) {
    return 'Weekdays';
  }

  if (
    Object.keys(schedule).every(
      (key) => schedule[key as keyof Alarm['schedule']] === SCHEDULE_PRESETS.weekends[key as keyof Alarm['schedule']]
    )
  ) {
    return 'Weekends';
  }

  if (
    Object.keys(schedule).every(
      (key) => schedule[key as keyof Alarm['schedule']] === SCHEDULE_PRESETS.daily[key as keyof Alarm['schedule']]
    )
  ) {
    return 'Daily';
  }

  return null;
}
