import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlarms } from '../hooks/useAlarms';
import { ALARM_SOUNDS } from '../types/alarm';

export default function HomeScreen() {
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
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Alarms</Text>
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
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={item.enabled ? '#007AFF' : '#f4f3f4'}
                />
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteAlarm(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
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
  title: {
    fontSize: 32,
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
    fontSize: 28,
    fontWeight: '300',
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
  },
  listContent: {
    padding: 16,
  },
  alarmCard: {
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
  alarmMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTime: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alarmLabel: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  alarmSchedule: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  alarmSound: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
