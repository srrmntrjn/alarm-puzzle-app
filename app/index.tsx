import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, StatusBar, TextInput, Modal, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlarms } from '../hooks/useAlarms';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

// Available reactions
const REACTIONS = ['👍', '❤️', '😂', '🔥', '💪', '😴'];

// Mock friends data - would come from backend in real app
const MOCK_FRIENDS_FEED = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: '👩‍💼',
    todayScore: 0,
    alarms: [
      { label: 'Morning Workout', time: '6:00 AM', snoozes: 0, duration: 1 }, // 1 minute
    ],
    timestamp: '2 hours ago',
    reactions: { '🔥': 3, '💪': 2 },
    comments: [
      { id: 'c1', user: 'Mike Johnson', avatar: '👨‍💻', text: 'Killing it! 💪', timestamp: '1 hour ago' },
    ],
    stats: {
      friendsCount: 24,
      avgDismissalTime: 3, // minutes
      lifetimeSnoozes: 45,
    },
  },
  {
    id: '2',
    name: 'Mike Johnson',
    avatar: '👨‍💻',
    todayScore: 1,
    alarms: [
      { label: 'Work Meeting', time: '9:00 AM', snoozes: 1, duration: 12 }, // 12 minutes
    ],
    timestamp: '3 hours ago',
    reactions: { '👍': 1 },
    comments: [],
    stats: {
      friendsCount: 18,
      avgDismissalTime: 8, // minutes
      lifetimeSnoozes: 127,
    },
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: '👩‍🎨',
    todayScore: 5,
    alarms: [
      { label: 'Wake Up', time: '7:00 AM', snoozes: 5, duration: 52 }, // 52 minutes
    ],
    timestamp: '4 hours ago',
    reactions: { '😂': 2, '😴': 4 },
    comments: [
      { id: 'c2', user: 'Alex Park', avatar: '🧑‍🔬', text: 'We all have those days 😅', timestamp: '3 hours ago' },
      { id: 'c3', user: 'Sarah Chen', avatar: '👩‍💼', text: 'Haha same! Monday vibes', timestamp: '3 hours ago' },
      { id: 'c4', user: 'Mike Johnson', avatar: '👨‍💻', text: 'At least you got up eventually!', timestamp: '2 hours ago' },
      { id: 'c5', user: 'Jamie Lee', avatar: '👨‍🎨', text: 'The struggle is real 😴', timestamp: '2 hours ago' },
      { id: 'c6', user: 'Taylor Kim', avatar: '👩‍🔬', text: 'Coffee time! ☕', timestamp: '1 hour ago' },
      { id: 'c7', user: 'Jordan Smith', avatar: '🧑‍💼', text: 'Been there! You got this 💪', timestamp: '45 min ago' },
      { id: 'c8', user: 'Casey Brown', avatar: '👨‍🏫', text: 'Tomorrow will be better!', timestamp: '30 min ago' },
    ],
    stats: {
      friendsCount: 31,
      avgDismissalTime: 22, // minutes
      lifetimeSnoozes: 342,
    },
  },
  {
    id: '4',
    name: 'Alex Park',
    avatar: '🧑‍🔬',
    todayScore: 1,
    alarms: [
      { label: 'Gym Time', time: '6:30 AM', snoozes: 1, duration: 8 }, // 8 minutes
    ],
    timestamp: '5 hours ago',
    reactions: { '💪': 1 },
    comments: [],
    stats: {
      friendsCount: 15,
      avgDismissalTime: 6, // minutes
      lifetimeSnoozes: 89,
    },
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { alarms, loading } = useAlarms();
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const [feedData, setFeedData] = useState(MOCK_FRIENDS_FEED);
  const [selectedProfile, setSelectedProfile] = useState<typeof MOCK_FRIENDS_FEED[0] | null>(null);
  const [showCustomEmojiInput, setShowCustomEmojiInput] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const reactionModalAnim = useRef(new Animated.Value(0)).current;
  const commentsDrawerAnim = useRef(new Animated.Value(0)).current;

  // Animate modal slide up
  useEffect(() => {
    if (selectedProfile) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedProfile]);

  // Animate reaction modal fade
  useEffect(() => {
    if (showReactionPicker) {
      reactionModalAnim.setValue(0);
      Animated.timing(reactionModalAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(reactionModalAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [showReactionPicker]);

  // Animate comments drawer
  useEffect(() => {
    if (selectedPostForComments) {
      Animated.spring(commentsDrawerAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(commentsDrawerAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedPostForComments]);

  // Calculate today's scores from alarm history
  const getTodayScores = () => {
    const today = new Date().toDateString();
    return alarms.map(alarm => {
      const todayEvents = alarm.history.filter(event =>
        new Date(event.triggeredAt).toDateString() === today
      );
      const totalSnoozes = todayEvents.reduce((sum, event) => sum + event.snoozeCount, 0);

      return {
        alarmId: alarm.id,
        label: alarm.label,
        time: `${alarm.time.hour % 12 || 12}:${alarm.time.minute.toString().padStart(2, '0')} ${alarm.time.hour >= 12 ? 'PM' : 'AM'}`,
        snoozes: totalSnoozes,
      };
    });
  };

  const myScores = getTodayScores();
  const myTotalScore = myScores.reduce((sum, score) => sum + score.snoozes, 0);

  const getScoreColor = (score: number) => {
    if (score === 0) return COLORS.success;
    if (score <= 2) return COLORS.warning;
    return COLORS.danger;
  };

  const getScoreEmoji = (score: number) => {
    if (score === 0) return '🎉';
    if (score <= 2) return '😴';
    return '😵';
  };

  const handleReaction = (postId: string, emoji: string) => {
    if (!emoji.trim()) return;

    // Extract first emoji character (in case user types multiple)
    const emojiMatch = emoji.match(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu);
    const firstEmoji = emojiMatch ? emojiMatch[0] : emoji.charAt(0);

    setFeedData(prev => prev.map(post => {
      if (post.id === postId) {
        const reactions = { ...post.reactions };
        reactions[firstEmoji] = (reactions[firstEmoji] || 0) + 1;
        return { ...post, reactions };
      }
      return post;
    }));
    setShowReactionPicker(null);
    setCustomEmojiInput('');
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;

    setFeedData(prev => prev.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: `c${Date.now()}`,
          user: 'You',
          avatar: '😊',
          text: commentText,
          timestamp: 'Just now',
        };
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));
    setCommentText('');
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(expandedComments === postId ? null : postId);
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.headerButtonText}>👤</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Snoozy</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('/alarms')}
        >
          <Text style={styles.headerButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* Your Score Section */}
            <View style={styles.myScoreSection}>
              <Text style={styles.sectionTitle}>Today's Score</Text>
              <View style={styles.myScoreCard}>
                <View style={styles.scoreHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.myAvatar}>😊</Text>
                  </View>
                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreName}>You</Text>
                    <Text style={styles.scoreSubtext}>{myScores.length} alarm{myScores.length !== 1 ? 's' : ''} today</Text>
                  </View>
                  <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(myTotalScore) }]}>
                    <Text style={styles.scoreNumber}>{myTotalScore}</Text>
                  </View>
                </View>

                {myScores.length === 0 ? (
                  <View style={styles.noAlarms}>
                    <Text style={styles.noAlarmsText}>No alarms set for today</Text>
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={() => router.push('/alarms')}
                    >
                      <Text style={styles.createButtonText}>Manage Alarms</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.alarmBreakdown}>
                    {myScores.map((score, index) => (
                      <View key={score.alarmId} style={styles.alarmRow}>
                        <View style={styles.alarmRowLeft}>
                          <Text style={styles.alarmRowLabel}>{score.label}</Text>
                          <Text style={styles.alarmRowTime}>{score.time}</Text>
                        </View>
                        <View style={styles.alarmRowRight}>
                          <Text style={[styles.alarmRowScore, { color: getScoreColor(score.snoozes) }]}>
                            {score.snoozes === 0 ? '✓' : `${score.snoozes} snooze${score.snoozes > 1 ? 's' : ''}`}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {myTotalScore === 0 && myScores.length > 0 && (
                  <View style={styles.celebration}>
                    <Text style={styles.celebrationText}>Perfect! No snoozes today! 🎉</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Friends Feed Section */}
            <View style={styles.feedSection}>
              <View style={styles.feedHeader}>
                <Text style={styles.sectionTitle}>Friends Feed</Text>
                <TouchableOpacity onPress={() => router.push('/friends')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        data={feedData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
            <View style={styles.feedCard}>
              <TouchableOpacity
                style={styles.feedCardHeader}
                onPress={() => setSelectedProfile(item)}
                activeOpacity={0.7}
              >
                <View style={styles.feedAvatarContainer}>
                  <Text style={styles.feedAvatar}>{item.avatar}</Text>
                </View>
                <View style={styles.feedInfo}>
                  <Text style={styles.feedName}>{item.name}</Text>
                  <Text style={styles.feedTimestamp}>{item.timestamp}</Text>
                </View>
                <View style={[styles.feedScoreBadge, { backgroundColor: getScoreColor(item.todayScore) }]}>
                  <Text style={styles.feedScoreNumber}>{item.todayScore}</Text>
                </View>
              </TouchableOpacity>

            <View style={styles.feedAlarms}>
              {item.alarms.map((alarm, index) => (
                <View key={index} style={styles.feedAlarmRow}>
                  <Text style={styles.feedAlarmLabel}>{alarm.label}</Text>
                  <Text style={styles.feedAlarmDetail}>
                    {alarm.time} • {alarm.snoozes === 0 ? 'No snoozes' : `${alarm.snoozes} snooze${alarm.snoozes > 1 ? 's' : ''}`} • Dismissed in {alarm.duration}m {getScoreEmoji(alarm.snoozes)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Reactions Bar with Add Button */}
            <View style={styles.reactionsBar}>
              <TouchableOpacity
                style={styles.addReactionButton}
                onPress={(e) => {
                  e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                    setButtonPosition({ x: pageX, y: pageY });
                    setShowReactionPicker(showReactionPicker === item.id ? null : item.id);
                  });
                }}
              >
                <Text style={styles.addReactionText}>+</Text>
              </TouchableOpacity>
              {Object.entries(item.reactions).map(([emoji, count]) => (
                <View key={emoji} style={styles.reactionBadge}>
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  <Text style={styles.reactionCount}>{count}</Text>
                </View>
              ))}
            </View>

            {/* Comments Preview (5 most recent) */}
            {item.comments.length > 0 && (
              <View style={styles.commentsSection}>
                {item.comments.slice(-5).map((comment) => (
                  <View key={comment.id} style={styles.commentRow}>
                    <Text style={styles.commentText}>
                      <Text style={styles.commentUser}>{comment.user} </Text>
                      {comment.text}
                    </Text>
                  </View>
                ))}
                {item.comments.length > 5 && (
                  <TouchableOpacity onPress={() => setSelectedPostForComments(item.id)}>
                    <Text style={styles.viewAllComments}>View all {item.comments.length} comments</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.addCommentButton}
                  onPress={() => setSelectedPostForComments(item.id)}
                >
                  <Text style={styles.addCommentButtonText}>Add a comment</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Add Comment Button (when no comments) */}
            {item.comments.length === 0 && (
              <View style={styles.commentsSection}>
                <TouchableOpacity
                  style={styles.addCommentButton}
                  onPress={() => setSelectedPostForComments(item.id)}
                >
                  <Text style={styles.addCommentButtonText}>Add a comment</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyFeed}>
            <Text style={styles.emptyFeedText}>No friends yet</Text>
            <Text style={styles.emptyFeedSubtext}>Add friends to see their scores</Text>
          </View>
        }
      />

      {/* Reaction Picker Modal */}
      <Modal
        visible={showReactionPicker !== null}
        animationType="none"
        transparent={true}
        onRequestClose={() => {
          setShowReactionPicker(null);
          setShowCustomEmojiInput(false);
          setCustomEmojiInput('');
        }}
      >
        <Animated.View
          style={[
            styles.reactionModalBackdrop,
            {
              opacity: reactionModalAnim,
            }
          ]}
        >
          <TouchableOpacity
            style={styles.reactionModalBackdropTouchable}
            activeOpacity={1}
            onPress={() => {
              setShowReactionPicker(null);
              setShowCustomEmojiInput(false);
              setCustomEmojiInput('');
            }}
          >
            <Animated.View
              style={[
                styles.reactionModalContent,
                {
                  position: 'absolute',
                  left: buttonPosition.x,
                  top: buttonPosition.y - 60,
                  opacity: reactionModalAnim,
                  transform: [{
                    scale: reactionModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }],
                }
              ]}
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
            <View style={styles.reactionBubble}>
              {!showCustomEmojiInput ? (
                <>
                  {REACTIONS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.reactionBubbleButton}
                      onPress={() => {
                        handleReaction(showReactionPicker!, emoji);
                        setShowReactionPicker(null);
                      }}
                    >
                      <Text style={styles.reactionBubbleEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.reactionBubbleButton}
                    onPress={() => setShowCustomEmojiInput(true)}
                  >
                    <Text style={styles.reactionBubblePlus}>+</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.customEmojiInputContainer}>
                  <TextInput
                    style={styles.customEmojiInputField}
                    placeholder="Tap to select emoji..."
                    placeholderTextColor={COLORS.textTertiary}
                    value={customEmojiInput}
                    onChangeText={(text) => {
                      setCustomEmojiInput(text);
                      // Auto-submit when an emoji is entered
                      if (text.trim() && showReactionPicker) {
                        setTimeout(() => {
                          handleReaction(showReactionPicker, text);
                          setShowReactionPicker(null);
                          setCustomEmojiInput('');
                          setShowCustomEmojiInput(false);
                        }, 100);
                      }
                    }}
                    autoFocus={true}
                    returnKeyType="done"
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    style={styles.customEmojiBackButton}
                    onPress={() => {
                      setShowCustomEmojiInput(false);
                      setCustomEmojiInput('');
                    }}
                  >
                    <Text style={styles.customEmojiBackText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Profile Modal */}
      <Modal
        visible={selectedProfile !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedProfile(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedProfile(null)}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                }],
              }
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {selectedProfile && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalProfileSection}>
                    <Text style={styles.modalAvatar}>{selectedProfile.avatar}</Text>
                    <View style={styles.modalProfileInfo}>
                      <Text style={styles.modalName}>{selectedProfile.name}</Text>
                      <View style={[styles.modalScoreBadge, { backgroundColor: getScoreColor(selectedProfile.todayScore) }]}>
                        <Text style={styles.modalScoreText}>Today: {selectedProfile.todayScore}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setSelectedProfile(null)}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{selectedProfile.stats.friendsCount}</Text>
                    <Text style={styles.statLabel}>Friends</Text>
                  </View>
                  <View style={styles.statBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={styles.statValue}>{selectedProfile.stats.avgDismissalTime}</Text>
                      <Text style={styles.statUnit}> min</Text>
                    </View>
                    <Text style={styles.statLabel}>Avg Time{'\n'}to Dismiss</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{selectedProfile.stats.lifetimeSnoozes}</Text>
                    <Text style={styles.statLabel}>Lifetime Snoozes</Text>
                  </View>
                </View>

                {/* Most Recent Post */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Most Recent Post</Text>
                  <View style={styles.modalPostCard}>
                    <Text style={styles.modalPostTimestamp}>{selectedProfile.timestamp}</Text>
                    <View style={styles.modalPostAlarm}>
                      <Text style={styles.modalPostLabel}>{selectedProfile.alarms[0].label}</Text>
                      <Text style={styles.modalPostDetail}>
                        {selectedProfile.alarms[0].time} • {selectedProfile.alarms[0].snoozes === 0 ? 'No snoozes' : `${selectedProfile.alarms[0].snoozes} snooze${selectedProfile.alarms[0].snoozes > 1 ? 's' : ''}`} • Dismissed in {selectedProfile.alarms[0].duration}m {getScoreEmoji(selectedProfile.alarms[0].snoozes)}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Comments Drawer Modal */}
      <Modal
        visible={selectedPostForComments !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedPostForComments(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedPostForComments(null)}
        >
          <Animated.View
            style={[
              styles.commentsDrawer,
              {
                transform: [{
                  translateY: commentsDrawerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                }],
              }
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {selectedPostForComments && feedData.find(p => p.id === selectedPostForComments) && (
              <>
                <View style={styles.drawerHeader}>
                  <Text style={styles.drawerTitle}>Comments</Text>
                  <TouchableOpacity
                    style={styles.drawerCloseButton}
                    onPress={() => setSelectedPostForComments(null)}
                  >
                    <Text style={styles.drawerCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.drawerCommentsList}>
                  {feedData.find(p => p.id === selectedPostForComments)!.comments.map((comment) => (
                    <View key={comment.id} style={styles.drawerCommentRow}>
                      <Text style={styles.commentText}>
                        <Text style={styles.commentUser}>{comment.user} </Text>
                        {comment.text}
                      </Text>
                      <Text style={styles.drawerCommentTimestamp}>{comment.timestamp}</Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.drawerCommentInput}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor={COLORS.textTertiary}
                    value={commentText}
                    onChangeText={setCommentText}
                    onSubmitEditing={() => {
                      handleAddComment(selectedPostForComments);
                      setCommentText('');
                    }}
                    returnKeyType="send"
                  />
                  {commentText.length > 0 && (
                    <TouchableOpacity onPress={() => {
                      handleAddComment(selectedPostForComments);
                      setCommentText('');
                    }}>
                      <Text style={styles.commentSendButton}>Post</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Text style={styles.navItemIconActive}>🏠</Text>
          <Text style={styles.navItemTextActive}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/history')}>
          <Text style={styles.navItemIcon}>📊</Text>
          <Text style={styles.navItemText}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/friends')}>
          <Text style={styles.navItemIcon}>👥</Text>
          <Text style={styles.navItemText}>Friends</Text>
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
  title: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.text,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: TYPOGRAPHY.xl,
  },
  listContent: {
    paddingBottom: 100,
  },
  myScoreSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  myScoreCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  myAvatar: {
    fontSize: 48,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.text,
    marginBottom: 2,
  },
  scoreSubtext: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  scoreBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.text,
  },
  noAlarms: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  noAlarmsText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  createButtonText: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.regular,
  },
  alarmBreakdown: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  alarmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  alarmRowLeft: {
    flex: 1,
  },
  alarmRowLabel: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.text,
    marginBottom: 2,
  },
  alarmRowTime: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  alarmRowRight: {
    alignItems: 'flex-end',
  },
  alarmRowScore: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.regular,
  },
  celebration: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  celebrationText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.success,
  },
  feedSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
  },
  feedCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  feedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  feedAvatarContainer: {
    marginRight: SPACING.md,
  },
  feedAvatar: {
    fontSize: 40,
  },
  feedInfo: {
    flex: 1,
  },
  feedName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.text,
    marginBottom: 2,
  },
  feedTimestamp: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
  feedScoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedScoreNumber: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.text,
  },
  feedAlarms: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  feedAlarmRow: {
    marginBottom: SPACING.md,
  },
  feedAlarmLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  feedAlarmDetail: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
    lineHeight: 24,
  },
  emptyFeed: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyFeedText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptyFeedSubtext: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textTertiary,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 20,
    paddingTop: SPACING.md,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  navItemIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  navItemIconActive: {
    fontSize: 24,
    marginBottom: 4,
  },
  navItemText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  navItemTextActive: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
  },
  // Reactions styles
  reactionsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  addReactionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addReactionText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.regular,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  feedActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  feedActionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  feedActionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  // Reaction Modal
  reactionModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  reactionModalBackdropTouchable: {
    flex: 1,
  },
  reactionModalContent: {
    // Position will be set dynamically based on button position
  },
  // iMessage-style Reaction Bubble
  reactionBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    ...SHADOWS.large,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reactionBubbleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  reactionBubbleEmoji: {
    fontSize: 24,
  },
  reactionBubblePlus: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.bold,
  },
  customEmojiInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  customEmojiInputField: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.xxl,
    color: COLORS.text,
    textAlign: 'center',
    minWidth: 120,
  },
  customEmojiBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  customEmojiBackText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  // Comments styles (Instagram-like)
  commentsSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentRow: {
    marginBottom: SPACING.sm,
  },
  commentUser: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
  },
  commentText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text,
    lineHeight: 18,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  commentSendButton: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
    marginLeft: SPACING.sm,
  },
  viewAllComments: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  // Comments Drawer
  commentsDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  drawerTitle: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  drawerCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerCloseText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textSecondary,
  },
  drawerCommentsList: {
    flex: 1,
    padding: SPACING.lg,
  },
  drawerCommentRow: {
    marginBottom: SPACING.lg,
  },
  drawerCommentTimestamp: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  drawerCommentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  addCommentButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  addCommentButtonText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  // Profile Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.xl,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  modalProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalAvatar: {
    fontSize: 64,
    marginRight: SPACING.lg,
  },
  modalProfileInfo: {
    flex: 1,
  },
  modalName: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalScoreBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  modalScoreText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: TYPOGRAPHY.xl,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  statValue: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statUnit: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalSectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  modalPostCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  modalPostTimestamp: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    marginBottom: SPACING.md,
  },
  modalPostAlarm: {
    gap: SPACING.xs,
  },
  modalPostLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  modalPostDetail: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.text,
    lineHeight: 24,
  },
});
