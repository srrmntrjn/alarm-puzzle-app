import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Alarm } from '../types/alarm';
import { SCHEDULE_PRESETS } from '../utils/scheduleHelper';
import { Colors } from '../constants/Colors';

interface SchedulePresetsProps {
  schedule: Alarm['schedule'];
  onChange: (schedule: Alarm['schedule']) => void;
}

const PRESETS = [
  { key: 'weekdays' as const, label: 'Weekdays' },
  { key: 'weekends' as const, label: 'Weekends' },
  { key: 'daily' as const, label: 'Daily' },
];

export function SchedulePresets({ schedule, onChange }: SchedulePresetsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const handlePresetPress = (presetKey: keyof typeof SCHEDULE_PRESETS) => {
    onChange(SCHEDULE_PRESETS[presetKey]);
  };

  const isPresetActive = (presetKey: keyof typeof SCHEDULE_PRESETS) => {
    const preset = SCHEDULE_PRESETS[presetKey];
    return Object.keys(preset).every(
      (key) =>
        preset[key as keyof Alarm['schedule']] ===
        schedule[key as keyof Alarm['schedule']]
    );
  };

  return (
    <View style={styles.container}>
      {PRESETS.map((preset) => {
        const isActive = isPresetActive(preset.key);
        return (
          <TouchableOpacity
            key={preset.key}
            style={[
              styles.presetButton,
              {
                backgroundColor: isActive ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handlePresetPress(preset.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.presetText,
                { color: isActive ? '#FFFFFF' : colors.text },
              ]}
            >
              {preset.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
