import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlarms } from '../hooks/useAlarms';
import { ALARM_SOUNDS } from '../types/alarm';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

export default function AlarmsScreen() {
  const router = useRouter();
  const { alarms, loading, toggleAlarm, deleteAlarm } = useAlarms();

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const formatSchedule = (schedule: any) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activeDays = Object.entries(schedule)
      .filter(([_, enabled]) => enabled)
      .map(([day]) => days[['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(day)])
      .join(', ');
    return activeDays || 'No days selected';
  };

  const getSoundName = (soundId?: string) => {
    if (!soundId) return 'Default';
    const sound = ALARM_SOUNDS.find(s => s.id === soundId);
    return sound?.name || 'Default';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Alarms</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-alarm')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No alarms yet</Text>
          <Text style={styles.emptySubtext}>Tap + to create your first alarm</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.alarmCard}>
              <View style={styles.alarmMain}>
                <View style={styles.alarmInfo}>
                  <Text style={styles.alarmTime}>{formatTime(item.time.hour, item.time.minute)}</Text>
                  <Text style={styles.alarmLabel}>{item.label}</Text>
                  <Text style={styles.alarmSchedule}>{formatSchedule(item.schedule)}</Text>
                  <Text style={styles.alarmSound}>🔔 {getSoundName(item.sound)}</Text>
                </View>
                <Switch
                  value={item.enabled}
                  onValueChange={() => toggleAlarm(item.id)}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.text}
                  ios_backgroundColor={COLORS.border}
                />
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push({ pathname: '/edit-alarm', params: { alarmId: item.id } })}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push({ pathname: '/trigger-alarm', params: { alarmId: item.id } })}
                >
                  <Text style={styles.actionButtonText}>Test</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteAlarm(item.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: 60,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
  },
  backButtonText: {
    fontSize: 28,
    color: COLORS.primary,
  },
  title: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  addButtonText: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  listContent: {
    padding: SPACING.lg,
  },
  alarmCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  alarmMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTime: {
    fontSize: TYPOGRAPHY.huge,
    fontWeight: TYPOGRAPHY.regular,
    marginBottom: 4,
    color: COLORS.text,
  },
  alarmLabel: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.text,
    marginBottom: 4,
  },
  alarmSchedule: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  alarmSound: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.regular,
    textAlign: 'center',
  },
});
