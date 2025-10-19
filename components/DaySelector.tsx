import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Alarm } from '../types/alarm';
import { Colors } from '../constants/Colors';

interface DaySelectorProps {
  schedule: Alarm['schedule'];
  onChange: (schedule: Alarm['schedule']) => void;
}

const DAYS = [
  { key: 'monday' as const, label: 'M' },
  { key: 'tuesday' as const, label: 'T' },
  { key: 'wednesday' as const, label: 'W' },
  { key: 'thursday' as const, label: 'Th' },
  { key: 'friday' as const, label: 'F' },
  { key: 'saturday' as const, label: 'Sa' },
  { key: 'sunday' as const, label: 'Su' },
];

export function DaySelector({ schedule, onChange }: DaySelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const handleDayPress = (day: keyof Alarm['schedule']) => {
    onChange({
      ...schedule,
      [day]: !schedule[day],
    });
  };

  return (
    <View style={styles.container}>
      {DAYS.map((day) => {
        const isSelected = schedule[day.key];
        return (
          <TouchableOpacity
            key={day.key}
            style={[
              styles.dayButton,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleDayPress(day.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayText,
                { color: isSelected ? '#FFFFFF' : colors.text },
              ]}
            >
              {day.label}
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
    justifyContent: 'space-between',
    gap: 8,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
