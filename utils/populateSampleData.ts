import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../types/alarm';

const ALARMS_STORAGE_KEY = '@alarms';

/**
 * Populate sample alarm data with realistic history
 */
export async function populateSampleData(): Promise<void> {
  const now = new Date();

  // Helper to create dates in the past
  const daysAgo = (days: number, hour: number, minute: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };

  const sampleAlarms: Alarm[] = [
    {
      id: 'alarm-sample-1',
      time: { hour: 7, minute: 0 },
      label: 'Morning Workout',
      schedule: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      sound: 'gentle-chime',
      enabled: true,
      createdAt: daysAgo(30, 7, 0),
      snoozeSettings: { duration: 10 },
      notificationIds: [],
      history: [
        // Today - no snoozes (best day!)
        {
          id: 'event-1',
          triggeredAt: daysAgo(0, 7, 0),
          snoozeCount: 0,
          snoozeTimestamps: [],
          dismissedAt: daysAgo(0, 7, 1),
          status: 'dismissed',
        },
        // Yesterday - 1 snooze
        {
          id: 'event-2',
          triggeredAt: daysAgo(1, 7, 0),
          snoozeCount: 1,
          snoozeTimestamps: [daysAgo(1, 7, 10)],
          dismissedAt: daysAgo(1, 7, 11),
          status: 'dismissed',
        },
        // 2 days ago - 2 snoozes
        {
          id: 'event-3',
          triggeredAt: daysAgo(2, 7, 0),
          snoozeCount: 2,
          snoozeTimestamps: [daysAgo(2, 7, 10), daysAgo(2, 7, 20)],
          dismissedAt: daysAgo(2, 7, 22),
          status: 'dismissed',
        },
        // 3 days ago - perfect
        {
          id: 'event-4',
          triggeredAt: daysAgo(3, 7, 0),
          snoozeCount: 0,
          snoozeTimestamps: [],
          dismissedAt: daysAgo(3, 7, 2),
          status: 'dismissed',
        },
        // 4 days ago - 3 snoozes (rough morning)
        {
          id: 'event-5',
          triggeredAt: daysAgo(4, 7, 0),
          snoozeCount: 3,
          snoozeTimestamps: [daysAgo(4, 7, 10), daysAgo(4, 7, 20), daysAgo(4, 7, 30)],
          dismissedAt: daysAgo(4, 7, 35),
          status: 'dismissed',
        },
        // 7 days ago - weekend skipped but alarm went off
        {
          id: 'event-6',
          triggeredAt: daysAgo(7, 7, 0),
          snoozeCount: 1,
          snoozeTimestamps: [daysAgo(7, 7, 10)],
          dismissedAt: daysAgo(7, 7, 15),
          status: 'dismissed',
        },
      ],
    },
    {
      id: 'alarm-sample-2',
      time: { hour: 9, minute: 0 },
      label: 'Work Standup',
      schedule: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      sound: 'beep',
      enabled: true,
      createdAt: daysAgo(60, 9, 0),
      snoozeSettings: { duration: 5 },
      notificationIds: [],
      history: [
        // Today - 1 snooze
        {
          id: 'event-7',
          triggeredAt: daysAgo(0, 9, 0),
          snoozeCount: 1,
          snoozeTimestamps: [daysAgo(0, 9, 5)],
          dismissedAt: daysAgo(0, 9, 8),
          status: 'dismissed',
        },
        // Yesterday - no snoozes
        {
          id: 'event-8',
          triggeredAt: daysAgo(1, 9, 0),
          snoozeCount: 0,
          snoozeTimestamps: [],
          dismissedAt: daysAgo(1, 9, 1),
          status: 'dismissed',
        },
        // 2 days ago
        {
          id: 'event-9',
          triggeredAt: daysAgo(2, 9, 0),
          snoozeCount: 1,
          snoozeTimestamps: [daysAgo(2, 9, 5)],
          dismissedAt: daysAgo(2, 9, 7),
          status: 'dismissed',
        },
        // 3 days ago - 2 snoozes
        {
          id: 'event-10',
          triggeredAt: daysAgo(3, 9, 0),
          snoozeCount: 2,
          snoozeTimestamps: [daysAgo(3, 9, 5), daysAgo(3, 9, 10)],
          dismissedAt: daysAgo(3, 9, 12),
          status: 'dismissed',
        },
      ],
    },
    {
      id: 'alarm-sample-3',
      time: { hour: 22, minute: 0 },
      label: 'Bedtime Reminder',
      schedule: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
      sound: 'soft-bell',
      enabled: true,
      createdAt: daysAgo(14, 22, 0),
      snoozeSettings: { duration: 15 },
      notificationIds: [],
      history: [
        // Today - usually dismissed quickly
        {
          id: 'event-11',
          triggeredAt: daysAgo(0, 22, 0),
          snoozeCount: 0,
          snoozeTimestamps: [],
          dismissedAt: daysAgo(0, 22, 0),
          status: 'dismissed',
        },
        // Yesterday
        {
          id: 'event-12',
          triggeredAt: daysAgo(1, 22, 0),
          snoozeCount: 1,
          snoozeTimestamps: [daysAgo(1, 22, 15)],
          dismissedAt: daysAgo(1, 22, 16),
          status: 'dismissed',
        },
        // 2 days ago
        {
          id: 'event-13',
          triggeredAt: daysAgo(2, 22, 0),
          snoozeCount: 0,
          snoozeTimestamps: [],
          dismissedAt: daysAgo(2, 22, 1),
          status: 'dismissed',
        },
      ],
    },
    {
      id: 'alarm-sample-4',
      time: { hour: 6, minute: 30 },
      label: 'Early Gym',
      schedule: {
        monday: false,
        tuesday: false,
        wednesday: true,
        thursday: false,
        friday: false,
        saturday: true,
        sunday: false,
      },
      sound: 'energetic',
      enabled: false, // Disabled for now
      createdAt: daysAgo(20, 6, 30),
      snoozeSettings: { duration: 10 },
      notificationIds: [],
      history: [
        // Last triggered 4 days ago (Saturday)
        {
          id: 'event-14',
          triggeredAt: daysAgo(4, 6, 30),
          snoozeCount: 5,
          snoozeTimestamps: [
            daysAgo(4, 6, 40),
            daysAgo(4, 6, 50),
            daysAgo(4, 7, 0),
            daysAgo(4, 7, 10),
            daysAgo(4, 7, 20),
          ],
          dismissedAt: daysAgo(4, 7, 25),
          status: 'dismissed',
        },
        // Week before
        {
          id: 'event-15',
          triggeredAt: daysAgo(11, 6, 30),
          snoozeCount: 3,
          snoozeTimestamps: [
            daysAgo(11, 6, 40),
            daysAgo(11, 6, 50),
            daysAgo(11, 7, 0),
          ],
          dismissedAt: daysAgo(11, 7, 5),
          status: 'dismissed',
        },
      ],
    },
    {
      id: 'alarm-sample-5',
      time: { hour: 12, minute: 0 },
      label: 'Lunch Break',
      schedule: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      sound: 'gentle-chime',
      enabled: true,
      createdAt: daysAgo(45, 12, 0),
      snoozeSettings: { duration: 10 },
      notificationIds: [],
      history: [
        {
          id: 'event-16',
          triggeredAt: daysAgo(0, 12, 0),
          snoozeCount: 0,
          snoozeTimestamps: [],
          dismissedAt: daysAgo(0, 12, 0),
          status: 'dismissed',
        },
        {
          id: 'event-17',
          triggeredAt: daysAgo(1, 12, 0),
          snoozeCount: 0,
          snoozeTimestamps: [],
          dismissedAt: daysAgo(1, 12, 1),
          status: 'dismissed',
        },
        {
          id: 'event-18',
          triggeredAt: daysAgo(2, 12, 0),
          snoozeCount: 1,
          snoozeTimestamps: [daysAgo(2, 12, 10)],
          dismissedAt: daysAgo(2, 12, 12),
          status: 'dismissed',
        },
      ],
    },
  ];

  try {
    await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(sampleAlarms));
    console.log('✅ Sample alarm data populated successfully!');
    console.log(`📱 Created ${sampleAlarms.length} alarms with history`);
  } catch (error) {
    console.error('❌ Error populating sample data:', error);
    throw error;
  }
}

/**
 * Clear all alarm data
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ALARMS_STORAGE_KEY);
    console.log('✅ All alarm data cleared!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}
