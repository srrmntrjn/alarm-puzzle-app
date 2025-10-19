import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAlarms } from '../hooks/useAlarms';
import { DaySelector } from '../components/DaySelector';
import { SchedulePresets } from '../components/SchedulePresets';
import { Colors } from '../constants/Colors';
import { Alarm, ALARM_SOUNDS } from '../types/alarm';

export default function EditAlarmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ alarmId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { getAlarmById, updateAlarm } = useAlarms();

  const alarm = getAlarmById(params.alarmId);

  const [label, setLabel] = useState('');
  const [time, setTime] = useState(new Date());
  const [schedule, setSchedule] = useState<Alarm['schedule']>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const [sound, setSound] = useState(ALARM_SOUNDS[0].id);
  const [snoozeDuration, setSnoozeDuration] = useState(10);
  const [showTimePicker, setShowTimePicker] = useState(true);

  // Load alarm data when component mounts
  useEffect(() => {
    if (alarm) {
      setLabel(alarm.label);
      const alarmTime = new Date();
      alarmTime.setHours(alarm.time.hour);
      alarmTime.setMinutes(alarm.time.minute);
      setTime(alarmTime);
      setSchedule(alarm.schedule);
      setSound(alarm.sound || ALARM_SOUNDS[0].id);
      setSnoozeDuration(alarm.snoozeSettings.duration);
    }
  }, [alarm]);

  const handleSave = async () => {
    if (!alarm) return;

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
      await updateAlarm(alarm.id, {
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
      Alert.alert('Error', 'Failed to update alarm. Please try again.');
      console.error('Error updating alarm:', error);
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

  if (!alarm) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Alarm not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Time Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Time</Text>
          <View style={[styles.timePickerContainer, { backgroundColor: colors.card }]}>
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              textColor={colors.text}
              style={styles.timePicker}
            />
          </View>
        </View>

        {/* Label Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Label</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g., Work Alarm, Gym Time"
            placeholderTextColor={colors.secondaryText}
            maxLength={50}
          />
        </View>

        {/* Schedule Presets */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Presets</Text>
          <SchedulePresets schedule={schedule} onChange={setSchedule} />
        </View>

        {/* Day Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Custom Days</Text>
          <DaySelector schedule={schedule} onChange={setSchedule} />
        </View>

        {/* Sound Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alarm Sound</Text>
          <View style={styles.soundList}>
            {ALARM_SOUNDS.map((alarmSound) => (
              <TouchableOpacity
                key={alarmSound.id}
                style={[
                  styles.soundOption,
                  {
                    backgroundColor: sound === alarmSound.id ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSound(alarmSound.id)}
                activeOpacity={0.7}
              >
                <View style={styles.soundInfo}>
                  <Text
                    style={[
                      styles.soundName,
                      { color: sound === alarmSound.id ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {alarmSound.name}
                  </Text>
                  <Text
                    style={[
                      styles.soundDescription,
                      { color: sound === alarmSound.id ? '#FFFFFF' : colors.secondaryText },
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Snooze Duration</Text>
          <View style={styles.snoozeOptions}>
            {SNOOZE_OPTIONS.map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.snoozeButton,
                  {
                    backgroundColor:
                      snoozeDuration === duration ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSnoozeDuration(duration)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.snoozeText,
                    {
                      color: snoozeDuration === duration ? '#FFFFFF' : colors.text,
                    },
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
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timePickerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 8,
  },
  timePicker: {
    height: 200,
    width: '100%',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  soundList: {
    gap: 8,
  },
  soundOption: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  soundInfo: {
    flex: 1,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  soundDescription: {
    fontSize: 14,
  },
  snoozeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  snoozeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  snoozeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
