import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '../types/alarm';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedule notifications for an alarm
 */
export async function scheduleAlarmNotifications(alarm: Alarm): Promise<string[]> {
  const notificationIds: string[] = [];

  // Get active days
  const activeDays = Object.entries(alarm.schedule)
    .filter(([_, enabled]) => enabled)
    .map(([day]) => day);

  // Map day names to weekday numbers (1 = Monday, 7 = Sunday)
  const dayMapping: { [key: string]: number } = {
    monday: 2,
    tuesday: 3,
    wednesday: 4,
    thursday: 5,
    friday: 6,
    saturday: 7,
    sunday: 1,
  };

  // Schedule a notification for each active day
  for (const day of activeDays) {
    const weekday = dayMapping[day];

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Alarm',
        body: alarm.label,
        sound: true, // Use default sound for now
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: 'alarm',
        data: {
          alarmId: alarm.id,
          sound: alarm.sound,
        },
      },
      trigger: {
        hour: alarm.time.hour,
        minute: alarm.time.minute,
        weekday,
        repeats: true,
      },
    });

    notificationIds.push(notificationId);
  }

  return notificationIds;
}

/**
 * Cancel all notifications for an alarm
 */
export async function cancelAlarmNotifications(notificationIds: string[]): Promise<void> {
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule a snooze notification
 */
export async function scheduleSnoozeNotification(
  alarm: Alarm,
  snoozeDurationMinutes: number
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Alarm (Snoozed)',
      body: alarm.label,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      categoryIdentifier: 'alarm',
      data: {
        alarmId: alarm.id,
        sound: alarm.sound,
        isSnoozed: true,
      },
    },
    trigger: {
      seconds: snoozeDurationMinutes * 60,
    },
  });

  return notificationId;
}

/**
 * Set up notification categories with actions
 */
export async function setupNotificationCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync('alarm', [
    {
      identifier: 'snooze',
      buttonTitle: 'Snooze',
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'dismiss',
      buttonTitle: 'Dismiss',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);
}
