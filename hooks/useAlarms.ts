import { useState, useEffect, useCallback } from 'react';
import { Alarm, CreateAlarmInput, AlarmTriggerEvent } from '../types/alarm';
import * as storageService from '../services/storageService';

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load alarms from storage
  const loadAlarms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedAlarms = await storageService.getAlarms();
      // Sort by time (earliest first)
      const sorted = loadedAlarms.sort((a, b) => {
        if (a.time.hour !== b.time.hour) {
          return a.time.hour - b.time.hour;
        }
        return a.time.minute - b.time.minute;
      });
      setAlarms(sorted);
    } catch (err) {
      setError('Failed to load alarms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load alarms on mount
  useEffect(() => {
    loadAlarms();
  }, [loadAlarms]);

  // Create a new alarm
  const createAlarm = useCallback(async (input: CreateAlarmInput): Promise<Alarm> => {
    try {
      const newAlarm: Alarm = {
        id: generateId(),
        time: input.time,
        label: input.label,
        schedule: input.schedule,
        enabled: true,
        createdAt: new Date().toISOString(),
        snoozeSettings: input.snoozeSettings,
        history: [],
      };

      await storageService.saveAlarm(newAlarm);
      await loadAlarms();
      return newAlarm;
    } catch (err) {
      setError('Failed to create alarm');
      console.error(err);
      throw err;
    }
  }, [loadAlarms]);

  // Update an existing alarm
  const updateAlarm = useCallback(async (alarmId: string, updates: Partial<Alarm>): Promise<void> => {
    try {
      const alarm = alarms.find((a) => a.id === alarmId);
      if (!alarm) {
        throw new Error('Alarm not found');
      }

      const updatedAlarm: Alarm = {
        ...alarm,
        ...updates,
      };

      await storageService.saveAlarm(updatedAlarm);
      await loadAlarms();
    } catch (err) {
      setError('Failed to update alarm');
      console.error(err);
      throw err;
    }
  }, [alarms, loadAlarms]);

  // Delete an alarm
  const deleteAlarm = useCallback(async (alarmId: string): Promise<void> => {
    try {
      await storageService.deleteAlarm(alarmId);
      await loadAlarms();
    } catch (err) {
      setError('Failed to delete alarm');
      console.error(err);
      throw err;
    }
  }, [loadAlarms]);

  // Toggle alarm enabled/disabled
  const toggleAlarm = useCallback(async (alarmId: string): Promise<void> => {
    try {
      const alarm = alarms.find((a) => a.id === alarmId);
      if (!alarm) {
        throw new Error('Alarm not found');
      }

      await updateAlarm(alarmId, { enabled: !alarm.enabled });
    } catch (err) {
      setError('Failed to toggle alarm');
      console.error(err);
      throw err;
    }
  }, [alarms, updateAlarm]);

  // Add a history event to an alarm
  const addTriggerEvent = useCallback(async (
    alarmId: string,
    event: AlarmTriggerEvent
  ): Promise<void> => {
    try {
      await storageService.addHistoryEvent(alarmId, event);
      await loadAlarms();
    } catch (err) {
      setError('Failed to add trigger event');
      console.error(err);
      throw err;
    }
  }, [loadAlarms]);

  // Update a history event
  const updateTriggerEvent = useCallback(async (
    alarmId: string,
    eventId: string,
    updates: Partial<AlarmTriggerEvent>
  ): Promise<void> => {
    try {
      await storageService.updateHistoryEvent(alarmId, eventId, updates);
      await loadAlarms();
    } catch (err) {
      setError('Failed to update trigger event');
      console.error(err);
      throw err;
    }
  }, [loadAlarms]);

  // Get a single alarm by ID
  const getAlarmById = useCallback((alarmId: string): Alarm | undefined => {
    return alarms.find((a) => a.id === alarmId);
  }, [alarms]);

  return {
    alarms,
    loading,
    error,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    addTriggerEvent,
    updateTriggerEvent,
    getAlarmById,
    refreshAlarms: loadAlarms,
  };
}

// Simple ID generator
function generateId(): string {
  return `alarm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
