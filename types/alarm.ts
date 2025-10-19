export interface Alarm {
  id: string;
  time: {
    hour: number; // 0-23 (24-hour format)
    minute: number; // 0-59
  };
  label: string;
  schedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  enabled: boolean;
  createdAt: string; // ISO string
  sound?: string; // Optional sound name
  notificationIds?: string[]; // Scheduled notification IDs
  snoozeSettings: {
    duration: number; // minutes (5, 10, or 15)
  };
  history: AlarmTriggerEvent[];
}

export interface AlarmTriggerEvent {
  id: string;
  triggeredAt: string; // ISO string - when alarm first went off
  snoozeCount: number;
  snoozeTimestamps: string[]; // ISO strings - each time snooze was pressed
  dismissedAt: string | null; // ISO string or null if still active
  status: 'snoozed' | 'dismissed' | 'active';
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface CreateAlarmInput {
  time: {
    hour: number;
    minute: number;
  };
  label: string;
  schedule: Alarm['schedule'];
  sound?: string;
  snoozeSettings: {
    duration: number;
  };
}

export type AlarmSound = {
  id: string;
  name: string;
  description: string;
};

export const ALARM_SOUNDS: AlarmSound[] = [
  { id: 'radar', name: 'Radar', description: 'Classic beeping sound' },
  { id: 'bell', name: 'Bell', description: 'Traditional alarm bell' },
  { id: 'chime', name: 'Chime', description: 'Gentle chimes' },
  { id: 'digital', name: 'Digital', description: 'Electronic beeps' },
  { id: 'rooster', name: 'Rooster', description: 'Morning rooster call' },
  { id: 'ocean', name: 'Ocean Waves', description: 'Calming ocean sounds' },
];
