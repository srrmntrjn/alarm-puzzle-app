import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, AlarmTriggerEvent } from '../types/alarm';

const ALARMS_STORAGE_KEY = '@alarms';
const MAX_HISTORY_EVENTS = 50;
const MAX_HISTORY_DAYS = 30;

/**
 * Get all alarms from storage
 */
export async function getAlarms(): Promise<Alarm[]> {
  try {
    const alarmsJson = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
    if (!alarmsJson) {
      return [];
    }
    return JSON.parse(alarmsJson);
  } catch (error) {
    console.error('Error loading alarms:', error);
    return [];
  }
}

/**
 * Save a new alarm or update an existing one
 */
export async function saveAlarm(alarm: Alarm): Promise<void> {
  try {
    const alarms = await getAlarms();
    const existingIndex = alarms.findIndex((a) => a.id === alarm.id);

    if (existingIndex >= 0) {
      // Update existing alarm
      alarms[existingIndex] = alarm;
    } else {
      // Add new alarm
      alarms.push(alarm);
    }

    await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
  } catch (error) {
    console.error('Error saving alarm:', error);
    throw error;
  }
}

/**
 * Delete an alarm by ID
 */
export async function deleteAlarm(alarmId: string): Promise<void> {
  try {
    const alarms = await getAlarms();
    const filteredAlarms = alarms.filter((a) => a.id !== alarmId);
    await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(filteredAlarms));
  } catch (error) {
    console.error('Error deleting alarm:', error);
    throw error;
  }
}

/**
 * Get a single alarm by ID
 */
export async function getAlarmById(alarmId: string): Promise<Alarm | null> {
  try {
    const alarms = await getAlarms();
    return alarms.find((a) => a.id === alarmId) || null;
  } catch (error) {
    console.error('Error getting alarm:', error);
    return null;
  }
}

/**
 * Add a trigger event to an alarm's history
 */
export async function addHistoryEvent(
  alarmId: string,
  event: AlarmTriggerEvent
): Promise<void> {
  try {
    const alarms = await getAlarms();
    const alarm = alarms.find((a) => a.id === alarmId);

    if (!alarm) {
      throw new Error(`Alarm ${alarmId} not found`);
    }

    // Add new event to history
    alarm.history.unshift(event);

    // Clean up old history
    alarm.history = cleanupHistory(alarm.history);

    await saveAlarm(alarm);
  } catch (error) {
    console.error('Error adding history event:', error);
    throw error;
  }
}

/**
 * Update a trigger event in an alarm's history
 */
export async function updateHistoryEvent(
  alarmId: string,
  eventId: string,
  updates: Partial<AlarmTriggerEvent>
): Promise<void> {
  try {
    const alarms = await getAlarms();
    const alarm = alarms.find((a) => a.id === alarmId);

    if (!alarm) {
      throw new Error(`Alarm ${alarmId} not found`);
    }

    const eventIndex = alarm.history.findIndex((e) => e.id === eventId);
    if (eventIndex >= 0) {
      alarm.history[eventIndex] = {
        ...alarm.history[eventIndex],
        ...updates,
      };
      await saveAlarm(alarm);
    }
  } catch (error) {
    console.error('Error updating history event:', error);
    throw error;
  }
}

/**
 * Clean up history to keep only recent events
 * Keeps last 30 days OR 50 events, whichever limit is hit first
 */
function cleanupHistory(history: AlarmTriggerEvent[]): AlarmTriggerEvent[] {
  // Sort by triggeredAt (newest first)
  const sorted = [...history].sort(
    (a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
  );

  // Limit to max events
  const limitedByCount = sorted.slice(0, MAX_HISTORY_EVENTS);

  // Filter to last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - MAX_HISTORY_DAYS);

  const limitedByDate = limitedByCount.filter(
    (event) => new Date(event.triggeredAt) >= thirtyDaysAgo
  );

  return limitedByDate;
}

/**
 * Clear all alarms (useful for testing/reset)
 */
export async function clearAllAlarms(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ALARMS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing alarms:', error);
    throw error;
  }
}
