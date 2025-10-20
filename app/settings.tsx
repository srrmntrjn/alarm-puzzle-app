import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { populateSampleData, clearAllData } from '../utils/populateSampleData';

// Available emoji avatars
const AVATAR_OPTIONS = ['😊', '👨‍💻', '👩‍💼', '👨‍🎨', '👩‍🎨', '🧑‍🔬', '👨‍🏫', '👩‍🔬', '🧑‍💼', '👨‍⚕️', '👩‍⚕️', '🧑‍🎓'];

export default function SettingsScreen() {
  const router = useRouter();

  // Load from storage in real app
  const [name, setName] = useState('You');
  const [avatar, setAvatar] = useState('😊');
  const [bio, setBio] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSave = () => {
    if (name.trim() === '') {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    // Save to storage in real app
    Alert.alert('Success', 'Profile updated successfully!');
    router.back();
  };

  const handlePopulateSampleData = async () => {
    try {
      await populateSampleData();
      Alert.alert(
        'Success',
        'Sample alarm data has been populated! Check your alarms and history screens.',
        [{ text: 'OK', onPress: () => router.push('/alarms') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to populate sample data');
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data?',
      'This will delete all your alarms and history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All alarm data cleared!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <View style={styles.avatarSection}>
            <Text style={styles.avatarDisplay}>{avatar}</Text>
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={() => setShowAvatarPicker(!showAvatarPicker)}
            >
              <Text style={styles.changeAvatarText}>
                {showAvatarPicker ? 'Close' : 'Change'}
              </Text>
            </TouchableOpacity>
          </View>

          {showAvatarPicker && (
            <View style={styles.avatarPicker}>
              {AVATAR_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.avatarOption,
                    avatar === emoji && styles.avatarOptionSelected,
                  ]}
                  onPress={() => {
                    setAvatar(emoji);
                    setShowAvatarPicker(false);
                  }}
                >
                  <Text style={styles.avatarOptionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Name Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textSecondary}
            maxLength={30}
          />
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about yourself..."
            placeholderTextColor={COLORS.textSecondary}
            maxLength={150}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bio.length}/150</Text>
        </View>

        {/* Stats Section (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Friends</Text>
              <Text style={styles.statValue}>12</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Avg Minutes to Dismiss</Text>
              <Text style={styles.statValue}>5</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Lifetime Snoozes</Text>
              <Text style={styles.statValue}>234</Text>
            </View>
          </View>
        </View>

        {/* Developer Tools Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Tools</Text>
          <TouchableOpacity
            style={styles.devButton}
            onPress={handlePopulateSampleData}
            activeOpacity={0.7}
          >
            <Text style={styles.devButtonText}>📊 Populate Sample Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.devButton, styles.devButtonDanger]}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <Text style={styles.devButtonText}>🗑️ Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.regular,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  avatarDisplay: {
    fontSize: 80,
  },
  changeAvatarButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
  },
  changeAvatarText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.regular,
  },
  avatarPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  avatarOption: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
  },
  avatarOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  avatarOptionEmoji: {
    fontSize: 36,
  },
  input: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    fontSize: TYPOGRAPHY.base,
    borderWidth: 1,
    backgroundColor: COLORS.card,
    color: COLORS.text,
    borderColor: COLORS.border,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: SPACING.lg,
  },
  charCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.medium,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
  },
  devButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  devButtonDanger: {
    borderColor: COLORS.danger,
  },
  devButtonText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.text,
    textAlign: 'center',
  },
});
