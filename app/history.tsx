import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlarms } from '../hooks/useAlarms';
import { AlarmTriggerEvent } from '../types/alarm';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

type AlarmEventWithDetails = AlarmTriggerEvent & {
  alarmLabel: string;
  alarmTime: { hour: number; minute: number };
};

export default function HistoryScreen() {
  const router = useRouter();
  const { alarms, loading } = useAlarms();
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Collect all alarm events from all alarms
  const getAllEvents = (): AlarmEventWithDetails[] => {
    const events: AlarmEventWithDetails[] = [];

    alarms.forEach((alarm) => {
      alarm.history.forEach((event) => {
        events.push({
          ...event,
          alarmLabel: alarm.label,
          alarmTime: alarm.time,
        });
      });
    });

    // Sort by triggered time (newest first)
    return events.sort((a, b) =>
      new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    const displayMinute = minutes.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const formatAlarmTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return null;
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / 60000);
    return minutes;
  };

  const getSnoozeColor = (count: number) => {
    if (count === 0) return COLORS.success; // Green
    if (count <= 2) return COLORS.warning; // Orange
    return COLORS.danger; // Red
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const allEvents = getAllEvents();

  // Calculate stats
  const calculateStats = () => {
    if (allEvents.length === 0) {
      return {
        totalAlarms: 0,
        avgSnoozes: 0,
        totalSnoozes: 0,
        worstAlarm: null,
      };
    }

    const totalSnoozes = allEvents.reduce((sum, event) => sum + event.snoozeCount, 0);
    const avgSnoozes = (totalSnoozes / allEvents.length).toFixed(1);

    // Find alarm with most snoozes
    const alarmSnoozes: { [key: string]: { label: string; count: number } } = {};
    allEvents.forEach((event) => {
      const key = event.alarmLabel;
      if (!alarmSnoozes[key]) {
        alarmSnoozes[key] = { label: event.alarmLabel, count: 0 };
      }
      alarmSnoozes[key].count += event.snoozeCount;
    });

    const worstAlarm = Object.values(alarmSnoozes).sort((a, b) => b.count - a.count)[0];

    return {
      totalAlarms: allEvents.length,
      avgSnoozes: parseFloat(avgSnoozes),
      totalSnoozes,
      worstAlarm: worstAlarm?.count > 0 ? worstAlarm : null,
    };
  };

  const stats = calculateStats();

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
        <Text style={styles.title}>Patterns</Text>
        <View style={styles.placeholder} />
      </View>

      {allEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No alarm history yet</Text>
          <Text style={styles.emptySubtext}>Trigger an alarm to see your snooze patterns</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalAlarms}</Text>
                  <Text style={styles.statLabel}>Total Alarms</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.avgSnoozes}</Text>
                  <Text style={styles.statLabel}>Avg Snoozes</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalSnoozes}</Text>
                  <Text style={styles.statLabel}>Total Snoozes</Text>
                </View>
                <View style={styles.statCard}>
                  {stats.worstAlarm ? (
                    <>
                      <Text style={styles.statValue} numberOfLines={1}>
                        {stats.worstAlarm.label}
                      </Text>
                      <Text style={styles.statLabel}>Most Snoozed</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.statValue}>-</Text>
                      <Text style={styles.statLabel}>Most Snoozed</Text>
                    </>
                  )}
                </View>
              </View>
              <Text style={styles.historyTitle}>Recent History</Text>
            </View>
          }
          data={allEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isExpanded = expandedEventId === item.id;
            const duration = calculateDuration(item.triggeredAt, item.dismissedAt);

            return (
              <TouchableOpacity
                style={styles.eventCard}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.eventHeader}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventDate}>{formatDate(item.triggeredAt)}</Text>
                    <Text style={styles.eventLabel}>{item.alarmLabel}</Text>
                    <Text style={styles.eventTime}>
                      Set for {formatAlarmTime(item.alarmTime.hour, item.alarmTime.minute)} •
                      Went off at {formatTime(item.triggeredAt)}
                    </Text>
                  </View>
                  <View style={styles.eventBadge}>
                    <View
                      style={[
                        styles.snoozeBadge,
                        { backgroundColor: getSnoozeColor(item.snoozeCount) },
                      ]}
                    >
                      <Text style={styles.snoozeBadgeText}>{item.snoozeCount}</Text>
                    </View>
                    <Text style={styles.snoozeLabel}>
                      {item.snoozeCount === 1 ? 'snooze' : 'snoozes'}
                    </Text>
                  </View>
                </View>

                {duration !== null && (
                  <Text style={styles.durationText}>
                    Dismissed after {duration} minute{duration !== 1 ? 's' : ''}
                  </Text>
                )}

                {item.status === 'active' && (
                  <Text style={styles.activeText}>Still active</Text>
                )}

                {/* Expanded Details */}
                {isExpanded && item.snoozeTimestamps.length > 0 && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.expandedTitle}>Snooze Timeline:</Text>
                    {item.snoozeTimestamps.map((timestamp, index) => (
                      <View key={index} style={styles.snoozeTimestamp}>
                        <Text style={styles.timestampNumber}>#{index + 1}</Text>
                        <Text style={styles.timestampTime}>{formatTime(timestamp)}</Text>
                      </View>
                    ))}
                    {item.dismissedAt && (
                      <View style={styles.snoozeTimestamp}>
                        <Text style={[styles.timestampNumber, styles.dismissedLabel]}>✓</Text>
                        <Text style={styles.timestampTime}>
                          Dismissed at {formatTime(item.dismissedAt)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {isExpanded && item.snoozeCount === 0 && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.noSnoozeText}>
                      {item.dismissedAt
                        ? '✅ Dismissed immediately - Great job!'
                        : 'No snoozes yet'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
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
  placeholder: {
    width: 40,
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
    paddingTop: 0,
  },
  statsContainer: {
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'flex-start',
    ...SHADOWS.medium,
  },
  statValue: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    textAlign: 'left',
  },
  historyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.regular,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  eventCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  eventDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  eventLabel: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.regular,
    marginBottom: 4,
    color: COLORS.text,
  },
  eventTime: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  eventBadge: {
    alignItems: 'center',
  },
  snoozeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  snoozeBadgeText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.regular,
  },
  snoozeLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  durationText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    marginTop: SPACING.sm,
    fontWeight: TYPOGRAPHY.regular,
  },
  activeText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.warning,
    marginTop: SPACING.sm,
    fontWeight: TYPOGRAPHY.regular,
  },
  expandedContent: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  expandedTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.regular,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  snoozeTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timestampNumber: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.primary,
    width: 30,
  },
  timestampTime: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  dismissedLabel: {
    color: COLORS.success,
  },
  noSnoozeText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.success,
    fontStyle: 'italic',
  },
});
