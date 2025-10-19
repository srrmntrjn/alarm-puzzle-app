import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlarms } from '../hooks/useAlarms';
import { AlarmTriggerEvent } from '../types/alarm';

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
    if (count === 0) return '#34C759'; // Green
    if (count <= 2) return '#FF9500'; // Orange
    return '#FF3B30'; // Red
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
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Snooze Patterns</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
  },
  backButtonText: {
    fontSize: 28,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  statsContainer: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
    color: '#333',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  eventLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  snoozeLabel: {
    fontSize: 11,
    color: '#666',
  },
  durationText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
    fontWeight: '500',
  },
  activeText: {
    fontSize: 14,
    color: '#FF9500',
    marginTop: 8,
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  snoozeTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestampNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    width: 30,
  },
  timestampTime: {
    fontSize: 14,
    color: '#666',
  },
  dismissedLabel: {
    color: '#34C759',
  },
  noSnoozeText: {
    fontSize: 14,
    color: '#34C759',
    fontStyle: 'italic',
  },
});
