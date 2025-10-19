import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

export function EmptyState() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.container}>
      <Text style={[styles.emoji, { color: colors.secondaryText }]}>⏰</Text>
      <Text style={[styles.title, { color: colors.text }]}>No alarms yet</Text>
      <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
        Tap the + button to create your first alarm
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
