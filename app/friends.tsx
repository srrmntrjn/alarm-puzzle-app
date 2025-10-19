import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

// Mock data for visualization
const MOCK_FRIENDS = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: '👩‍💼',
    status: 'online',
    todayStats: {
      alarms: 1,
      snoozes: 0,
      avgSnoozes: 0.8,
    },
    weekStats: {
      totalAlarms: 7,
      totalSnoozes: 5,
      avgSnoozes: 0.7,
    },
    lastAlarm: {
      time: '7:00 AM',
      result: 'dismissed',
      snoozeCount: 0,
      timestamp: '2 hours ago',
    },
    rank: 1,
  },
  {
    id: '2',
    name: 'You',
    avatar: '😊',
    status: 'online',
    isYou: true,
    todayStats: {
      alarms: 1,
      snoozes: 2,
      avgSnoozes: 2.0,
    },
    weekStats: {
      totalAlarms: 7,
      totalSnoozes: 14,
      avgSnoozes: 2.0,
    },
    lastAlarm: {
      time: '7:30 AM',
      result: 'dismissed',
      snoozeCount: 2,
      timestamp: '1 hour ago',
    },
    rank: 4,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar: '👨‍💻',
    status: 'online',
    todayStats: {
      alarms: 2,
      snoozes: 1,
      avgSnoozes: 1.2,
    },
    weekStats: {
      totalAlarms: 12,
      totalSnoozes: 15,
      avgSnoozes: 1.25,
    },
    lastAlarm: {
      time: '6:30 AM',
      result: 'dismissed',
      snoozeCount: 1,
      timestamp: '3 hours ago',
    },
    rank: 2,
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: '👩‍🎨',
    status: 'offline',
    todayStats: {
      alarms: 1,
      snoozes: 5,
      avgSnoozes: 3.5,
    },
    weekStats: {
      totalAlarms: 6,
      totalSnoozes: 21,
      avgSnoozes: 3.5,
    },
    lastAlarm: {
      time: '8:00 AM',
      result: 'dismissed',
      snoozeCount: 5,
      timestamp: '30 minutes ago',
    },
    rank: 5,
  },
  {
    id: '5',
    name: 'Alex Park',
    avatar: '🧑‍🔬',
    status: 'online',
    todayStats: {
      alarms: 1,
      snoozes: 1,
      avgSnoozes: 1.5,
    },
    weekStats: {
      totalAlarms: 7,
      totalSnoozes: 10,
      avgSnoozes: 1.4,
    },
    lastAlarm: {
      time: '7:15 AM',
      result: 'dismissed',
      snoozeCount: 1,
      timestamp: '90 minutes ago',
    },
    rank: 3,
  },
];

export default function FriendsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'today' | 'week'>('today');

  const getStatusColor = (status: string) => {
    return status === 'online' ? COLORS.success : COLORS.textTertiary;
  };

  const getSnoozeColor = (count: number) => {
    if (count === 0) return COLORS.success;
    if (count <= 2) return COLORS.warning;
    return COLORS.danger;
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const sortedFriends = [...MOCK_FRIENDS].sort((a, b) => {
    const statsKey = selectedTab === 'today' ? 'todayStats' : 'weekStats';
    return a[statsKey].avgSnoozes - b[statsKey].avgSnoozes;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'today' && styles.activeTab]}
          onPress={() => setSelectedTab('today')}
        >
          <Text style={[styles.tabText, selectedTab === 'today' && styles.activeTabText]}>
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'week' && styles.activeTab]}
          onPress={() => setSelectedTab('week')}
        >
          <Text style={[styles.tabText, selectedTab === 'week' && styles.activeTabText]}>
            This Week
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard */}
      <FlatList
        data={sortedFriends}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardTitle}>🏆 Leaderboard</Text>
            <Text style={styles.leaderboardSubtitle}>Least snoozes wins!</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const stats = selectedTab === 'today' ? item.todayStats : item.weekStats;
          const isYou = item.isYou;

          return (
            <View style={[styles.friendCard, isYou && styles.yourCard]}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{getRankEmoji(index + 1)}</Text>
              </View>

              <View style={styles.friendInfo}>
                <View style={styles.friendHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>{item.avatar}</Text>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(item.status) },
                      ]}
                    />
                  </View>
                  <View style={styles.nameContainer}>
                    <Text style={[styles.name, isYou && styles.yourName]}>
                      {item.name} {isYou && '(You)'}
                    </Text>
                    {item.lastAlarm && (
                      <Text style={styles.lastSeen}>{item.lastAlarm.timestamp}</Text>
                    )}
                  </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.alarms}</Text>
                    <Text style={styles.statLabel}>Alarms</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statValue,
                        { color: getSnoozeColor(stats.snoozes) },
                      ]}
                    >
                      {stats.snoozes}
                    </Text>
                    <Text style={styles.statLabel}>Snoozes</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.avgSnoozes.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Avg</Text>
                  </View>
                </View>

                {/* Last Alarm */}
                {item.lastAlarm && (
                  <View style={styles.lastAlarmContainer}>
                    <Text style={styles.lastAlarmText}>
                      Last: {item.lastAlarm.time} •{' '}
                      <Text
                        style={{
                          color: getSnoozeColor(item.lastAlarm.snoozeCount),
                          fontWeight: '600',
                        }}
                      >
                        {item.lastAlarm.snoozeCount === 0
                          ? 'No snoozes! 🎉'
                          : `${item.lastAlarm.snoozeCount} snooze${
                              item.lastAlarm.snoozeCount > 1 ? 's' : ''
                            }`}
                      </Text>
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Share Your Progress</Text>
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
    fontSize: 24,
    fontWeight: TYPOGRAPHY.regular,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.text,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  leaderboardHeader: {
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  leaderboardTitle: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.regular,
    marginBottom: 4,
    color: COLORS.text,
  },
  leaderboardSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  friendCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    ...SHADOWS.medium,
  },
  yourCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
  },
  rankBadge: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: SPACING.md,
  },
  rankText: {
    fontSize: 24,
  },
  friendInfo: {
    flex: 1,
  },
  friendHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    fontSize: 40,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.regular,
    marginBottom: 2,
    color: COLORS.text,
  },
  yourName: {
    color: COLORS.primary,
  },
  lastSeen: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lastAlarmContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  lastAlarmText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  actionButtonText: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.regular,
  },
});
