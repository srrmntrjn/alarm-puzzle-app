import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useAlarms } from '../hooks/useAlarms';
import { DaySelector } from '../components/DaySelector';
import { SchedulePresets } from '../components/SchedulePresets';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { Alarm, ALARM_SOUNDS } from '../types/alarm';
import { SCHEDULE_PRESETS } from '../utils/scheduleHelper';

export default function CreateAlarmScreen() {
  const router = useRouter();
  const { createAlarm } = useAlarms();

  const [label, setLabel] = useState('');
  const [time, setTime] = useState(new Date());
  const [schedule, setSchedule] = useState<Alarm['schedule']>(SCHEDULE_PRESETS.weekdays);
  const [sound, setSound] = useState(ALARM_SOUNDS[0].id);
  const [snoozeDuration, setSnoozeDuration] = useState(10);
  const [showTimePicker, setShowTimePicker] = useState(true);

  const handleSave = async () => {
    // Validation
    if (label.trim() === '') {
      Alert.alert('Missing Label', 'Please enter a label for your alarm');
      return;
    }

    const hasSchedule = Object.values(schedule).some((enabled) => enabled);
    if (!hasSchedule) {
      Alert.alert('No Days Selected', 'Please select at least one day for your alarm');
      return;
    }

    try {
      await createAlarm({
        time: {
          hour: time.getHours(),
          minute: time.getMinutes(),
        },
        label: label.trim(),
        schedule,
        sound,
        snoozeSettings: {
          duration: snoozeDuration,
        },
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create alarm. Please try again.');
      console.error('Error creating alarm:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleTimeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  const SNOOZE_OPTIONS = [5, 10, 15];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Time Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time</Text>
          <View style={styles.timePickerContainer}>
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              textColor={COLORS.text}
              style={styles.timePicker}
            />
          </View>
        </View>

        {/* Label Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Label</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g., Work Alarm, Gym Time"
            placeholderTextColor={COLORS.textSecondary}
            maxLength={50}
          />
        </View>

        {/* Schedule Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Presets</Text>
          <SchedulePresets schedule={schedule} onChange={setSchedule} />
        </View>

        {/* Day Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Days</Text>
          <DaySelector schedule={schedule} onChange={setSchedule} />
        </View>

        {/* Sound Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alarm Sound</Text>
          <View style={styles.soundList}>
            {ALARM_SOUNDS.map((alarmSound) => (
              <TouchableOpacity
                key={alarmSound.id}
                style={[
                  styles.soundOption,
                  sound === alarmSound.id && styles.soundOptionSelected,
                ]}
                onPress={() => setSound(alarmSound.id)}
                activeOpacity={0.7}
              >
                <View style={styles.soundInfo}>
                  <Text
                    style={[
                      styles.soundName,
                      sound === alarmSound.id && styles.soundNameSelected,
                    ]}
                  >
                    {alarmSound.name}
                  </Text>
                  <Text
                    style={[
                      styles.soundDescription,
                      sound === alarmSound.id && styles.soundDescriptionSelected,
                    ]}
                  >
                    {alarmSound.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Snooze Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Snooze Duration</Text>
          <View style={styles.snoozeOptions}>
            {SNOOZE_OPTIONS.map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.snoozeButton,
                  snoozeDuration === duration && styles.snoozeButtonSelected,
                ]}
                onPress={() => setSnoozeDuration(duration)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.snoozeText,
                    snoozeDuration === duration && styles.snoozeTextSelected,
                  ]}
                >
                  {duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.regular,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  timePickerContainer: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.card,
  },
  timePicker: {
    height: 200,
    width: '100%',
  },
  input: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    fontSize: TYPOGRAPHY.base,
    borderWidth: 1,
    backgroundColor: COLORS.card,
    color: COLORS.text,
    borderColor: COLORS.border,
  },
  soundList: {
    gap: SPACING.sm,
  },
  soundOption: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  soundOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  soundInfo: {
    flex: 1,
  },
  soundName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.regular,
    marginBottom: 4,
    color: COLORS.text,
  },
  soundNameSelected: {
    color: COLORS.text,
  },
  soundDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  soundDescriptionSelected: {
    color: COLORS.text,
  },
  snoozeOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  snoozeButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  snoozeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  snoozeText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.text,
  },
  snoozeTextSelected: {
    color: COLORS.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    backgroundColor: COLORS.background,
    borderTopColor: COLORS.border,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.text,
  },
  saveButtonText: {
    color: COLORS.text,
  },
});
