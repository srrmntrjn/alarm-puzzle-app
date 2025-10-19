import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { useAlarms } from '../hooks/useAlarms';
import { scheduleSnoozeNotification } from '../services/notificationService';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

export default function TriggerAlarmScreen() {
  const params = useLocalSearchParams<{ alarmId: string; eventId?: string }>();
  const router = useRouter();
  const { getAlarmById, addTriggerEvent, updateTriggerEvent } = useAlarms();
  const [alarm, setAlarm] = useState<ReturnType<typeof getAlarmById>>(null);
  const [currentEventId, setCurrentEventId] = useState(params.eventId);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [sound, setSound] = useState<Audio.Sound>();
  const autoSnoozeTimer = useRef<NodeJS.Timeout>();

  // Load alarm when component mounts or alarmId changes
  useEffect(() => {
    const loadedAlarm = getAlarmById(params.alarmId);
    setAlarm(loadedAlarm);
  }, [params.alarmId, getAlarmById]);

  useEffect(() => {
    if (!alarm) return; // Don't run until alarm is loaded

    // Request audio permissions and play alarm sound
    async function playAlarmSound() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });

        // TODO: Add actual alarm sound files and load based on alarm.sound
        // For now, skipping sound playback until we add audio assets
        // const { sound } = await Audio.Sound.createAsync(
        //   require('../assets/alarm.mp3'),
        //   { shouldPlay: true, isLooping: true, volume: 1.0 }
        // );
        // setSound(sound);
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    }

    playAlarmSound();

    // Create trigger event if this is a new alarm trigger
    if (!currentEventId) {
      const eventId = `event-${Date.now()}`;
      addTriggerEvent(alarm.id, {
        id: eventId,
        triggeredAt: new Date().toISOString(),
        snoozeCount: 0,
        snoozeTimestamps: [],
        dismissedAt: null,
        status: 'active',
      });
      setCurrentEventId(eventId);
    }

    // Auto-snooze after 2 minutes
    autoSnoozeTimer.current = setTimeout(() => {
      handleSnooze();
    }, 2 * 60 * 1000); // 2 minutes

    // Cleanup
    return () => {
      if (autoSnoozeTimer.current) {
        clearTimeout(autoSnoozeTimer.current);
      }
      sound?.unloadAsync();
    };
  }, [alarm]);

  const handleSnooze = async () => {
    if (!alarm || !currentEventId) return;

    try {
      // Stop sound
      await sound?.stopAsync();
      await sound?.unloadAsync();

      // Update event with snooze
      const newSnoozeCount = snoozeCount + 1;
      await updateTriggerEvent(alarm.id, currentEventId, {
        snoozeCount: newSnoozeCount,
        snoozeTimestamps: [
          ...(alarm.history.find(e => e.id === currentEventId)?.snoozeTimestamps || []),
          new Date().toISOString(),
        ],
        status: 'snoozed',
      });

      // Schedule snooze notification
      await scheduleSnoozeNotification(alarm, alarm.snoozeSettings.duration);

      // Go back to home
      router.replace('/');
    } catch (error) {
      console.error('Error handling snooze:', error);
    }
  };

  const handleDismiss = async () => {
    if (!alarm || !currentEventId) return;

    try {
      // Stop sound
      await sound?.stopAsync();
      await sound?.unloadAsync();

      // Update event as dismissed
      await updateTriggerEvent(alarm.id, currentEventId, {
        dismissedAt: new Date().toISOString(),
        status: 'dismissed',
      });

      // Go back to home
      router.replace('/');
    } catch (error) {
      console.error('Error handling dismiss:', error);
    }
  };

  if (!alarm) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorText}>Alarm not found</Text>
      </View>
    );
  }

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.time}>{formatTime(alarm.time.hour, alarm.time.minute)}</Text>
        <Text style={styles.label}>{alarm.label}</Text>
        {snoozeCount > 0 && (
          <Text style={styles.snoozeInfo}>Snoozed {snoozeCount} time{snoozeCount > 1 ? 's' : ''}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.snoozeButton]}
          onPress={handleSnooze}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Snooze ({alarm.snoozeSettings.duration} min)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dismissButton]}
          onPress={handleDismiss}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 50,
  },
  content: {
    alignItems: 'center',
  },
  time: {
    fontSize: 80,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    letterSpacing: 2,
  },
  label: {
    fontSize: TYPOGRAPHY.xxl,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  snoozeInfo: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  errorText: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.lg,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  button: {
    paddingVertical: SPACING.xxl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  snoozeButton: {
    backgroundColor: COLORS.warning,
  },
  dismissButton: {
    backgroundColor: COLORS.success,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
  },
});
