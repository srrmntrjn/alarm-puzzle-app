import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Alarm } from '../types/alarm';
import { formatTime } from '../utils/timeHelper';
import { formatSchedule } from '../utils/scheduleHelper';
import { Colors } from '../constants/Colors';

interface AlarmListItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
}

export function AlarmListItem({ alarm, onToggle }: AlarmListItemProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const handlePress = () => {
    router.push(`/alarm/${alarm.id}`);
  };

  const handleToggle = () => {
    onToggle(alarm.id);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <Text style={[styles.time, { color: alarm.enabled ? colors.text : colors.secondaryText }]}>
            {formatTime(alarm.time.hour, alarm.time.minute)}
          </Text>
          <Text style={[styles.label, { color: colors.secondaryText }]} numberOfLines={1}>
            {alarm.label}
          </Text>
          <Text style={[styles.schedule, { color: colors.secondaryText }]}>
            {formatSchedule(alarm.schedule)}
          </Text>
        </View>
        <Switch
          value={alarm.enabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftContent: {
    flex: 1,
    marginRight: 16,
  },
  time: {
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 2,
  },
  schedule: {
    fontSize: 14,
  },
});
