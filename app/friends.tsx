import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

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
    return status === 'online' ? '#34C759' : '#999';
  };

  const getSnoozeColor = (count: number) => {
    if (count === 0) return '#34C759';
    if (count <= 2) return '#FF9500';
    return '#FF3B30';
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  leaderboardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  friendCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  yourCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  rankBadge: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 24,
  },
  friendInfo: {
    flex: 1,
  },
  friendHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
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
    borderColor: '#fff',
  },
  nameContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  yourName: {
    color: '#007AFF',
  },
  lastSeen: {
    fontSize: 12,
    color: '#999',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  lastAlarmContainer: {
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 8,
  },
  lastAlarmText: {
    fontSize: 13,
    color: '#666',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
