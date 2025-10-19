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
  snoozeSettings: {
    duration: number; // minutes (5, 10, or 15)
  };
  history: AlarmTriggerEvent[];
}

export interface AlarmTriggerEvent {
  id: string;
  triggeredAt: string; // ISO string
  snoozeCount: number;
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
  snoozeSettings: {
    duration: number;
  };
}
