# Alarm Puzzle App - Implementation Plan

## Project Overview
A simple alarm clock app built with React Native that will eventually require solving puzzles to dismiss alarms. This plan covers v1: a basic functional alarm clock.

## Goal
Get a working alarm app running on your personal iPhone (no App Store submission required).

---

## Technology Stack

### Core
- **React Native** (cross-platform framework)
- **TypeScript** (type safety)
- **Expo** (simplifies React Native development and testing)

### Key Libraries
- **expo-notifications** - Local notifications for alarm triggers
- **@react-native-async-storage/async-storage** - Persist alarm data locally
- **expo-av** - Audio playback for alarm sounds
- **react-native-background-timer** - Background task scheduling
- **expo-keep-awake** - Prevent screen from sleeping when alarm is active

### Development Tools
- **Xcode** - Required for iOS simulator and device builds
- **Node.js & npm/yarn** - Package management
- **Expo Go** - Quick testing on physical device
- **EAS Build** (optional) - For standalone app builds

---

## v1 Scope - Simple Alarm Clock

### IN SCOPE
- ✅ Set a single alarm time
- ✅ Enable/disable alarm toggle
- ✅ Alarm triggers with notification when app is closed
- ✅ Alarm plays sound even in silent mode
- ✅ Alarm rings until manually dismissed (tap to stop)
- ✅ Alarm persists after app restart/phone reboot
- ✅ Basic UI with time picker
- ✅ Dark mode support
- ✅ Works on iOS simulator and physical iPhone

### OUT OF SCOPE (Future versions)
- ❌ Multiple alarms
- ❌ Recurring alarms (daily, weekdays, etc.)
- ❌ Snooze functionality
- ❌ Custom alarm sounds
- ❌ Alarm labels/names
- ❌ Gradual volume increase
- ❌ Custom vibration patterns
- ❌ Puzzle dismissal (v2 feature)

---

## Architecture

### File Structure
```
alarm-puzzle-app/
├── app/                    # Main app screens (Expo Router)
│   ├── index.tsx          # Home screen with alarm setter
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── TimePicker.tsx    # Time selection interface
│   └── AlarmToggle.tsx   # Enable/disable switch
├── services/             # Business logic
│   ├── alarmService.ts   # Alarm scheduling logic
│   ├── notificationService.ts  # Push notification handling
│   └── storageService.ts # AsyncStorage wrapper
├── hooks/                # Custom React hooks
│   └── useAlarm.ts      # Alarm state management
├── constants/            # App constants
│   └── Colors.ts        # Dark/light theme colors
├── types/               # TypeScript type definitions
│   └── alarm.ts        # Alarm data types
├── app.json            # Expo configuration
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

### Data Model
```typescript
interface Alarm {
  id: string;
  time: Date;          // Alarm time (hours + minutes)
  enabled: boolean;    // Is alarm active?
  createdAt: Date;
}
```

### Key Flows

#### 1. Setting an Alarm
```
User sets time → Save to AsyncStorage → Schedule notification → Update UI
```

#### 2. Alarm Triggers
```
Time reached → iOS notification fires → Play sound → Show dismiss screen
```

#### 3. Dismissing Alarm
```
User taps dismiss → Cancel notification → Stop sound → Update alarm state
```

---

## Implementation Phases

### Phase 1: Environment Setup (Day 1)
- [ ] Install Xcode from Mac App Store
- [ ] Install Node.js (if not already installed)
- [ ] Install Expo CLI globally: `npm install -g expo-cli`
- [ ] Initialize React Native project with Expo
- [ ] Set up TypeScript configuration
- [ ] Configure iOS simulator in Xcode
- [ ] Test basic "Hello World" on simulator

### Phase 2: Core Alarm Logic (Day 2-3)
- [ ] Create alarm data model (TypeScript types)
- [ ] Implement storage service with AsyncStorage
- [ ] Set up notification permissions
- [ ] Create notification service for scheduling alarms
- [ ] Implement alarm scheduling logic
- [ ] Test notification triggers in background

### Phase 3: UI Development (Day 3-4)
- [ ] Design basic home screen layout
- [ ] Create time picker component
- [ ] Add enable/disable toggle
- [ ] Display current alarm time
- [ ] Implement dark mode theming
- [ ] Add alarm dismiss screen

### Phase 4: Audio & Sound (Day 4-5)
- [ ] Set up expo-av for audio playback
- [ ] Add default alarm sound file to project
- [ ] Implement sound playback when alarm triggers
- [ ] Configure sound to play in silent mode (iOS audio categories)
- [ ] Ensure sound plays until dismissed

### Phase 5: Background & Persistence (Day 5-6)
- [ ] Configure app to run in background
- [ ] Ensure alarms persist after app closure
- [ ] Handle phone reboot scenarios
- [ ] Test alarm triggers with app closed
- [ ] Implement alarm state recovery on app launch

### Phase 6: Testing & Refinement (Day 6-7)
- [ ] Test on iOS simulator thoroughly
- [ ] Set up Expo Go on physical iPhone
- [ ] Test on physical device
- [ ] Fix any device-specific issues
- [ ] Test edge cases (timezone changes, date rollover)
- [ ] Polish UI/UX

### Phase 7: Device Installation (Day 7-8)
- [ ] Build standalone app using EAS Build (free tier)
- [ ] Install on personal iPhone via TestFlight or direct install
- [ ] Final testing on device
- [ ] Document any issues/improvements

---

## Development Setup Guide

### Prerequisites
1. **macOS** (required for iOS development)
2. **Homebrew** (package manager)
3. **Node.js 18+**
4. **Xcode 15+**

### Step-by-Step Setup

#### 1. Install Xcode
```bash
# Open Mac App Store and install Xcode (large download, ~10GB+)
# After install, open Xcode once to accept license agreement
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

#### 2. Install Command Line Tools
```bash
xcode-select --install
```

#### 3. Install CocoaPods (iOS dependency manager)
```bash
sudo gem install cocoapods
```

#### 4. Install Node.js (if not installed)
```bash
# Check if installed
node --version

# If not installed
brew install node
```

#### 5. Initialize React Native Project with Expo
```bash
cd /Users/sriramnatarajan/Projects/alarm-puzzle-app

# Create Expo app with TypeScript
npx create-expo-app@latest . --template blank-typescript

# Install required dependencies
npm install @react-native-async-storage/async-storage
npm install expo-notifications
npm install expo-av
npm install expo-keep-awake
```

#### 6. Set Up iOS Simulator
```bash
# List available simulators
xcrun simctl list devices

# Boot iPhone 15 simulator (or any recent model)
open -a Simulator

# Run app on simulator
npm run ios
```

#### 7. Set Up Physical Device Testing
```bash
# Install Expo Go from App Store on iPhone
# Run on same WiFi network
npm start

# Scan QR code with iPhone camera
```

---

## iOS-Specific Considerations

### Notification Permissions
- Must request explicit user permission for notifications
- Show permission prompt on first app launch
- Handle denied permissions gracefully

### Background Execution
- iOS limits background app execution
- Use local notifications (scheduled in advance) rather than background timers
- Configure `UIBackgroundModes` in app.json for audio playback

### Silent Mode Override
- Configure audio session category to `playback` with `mixWithOthers: false`
- Set `AVAudioSessionCategoryOptionDefaultToSpeaker`
- This allows alarm to play even when phone is in silent mode

### App Configuration (app.json)
```json
{
  "expo": {
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourname.alarmpuzzle",
      "infoPlist": {
        "UIBackgroundModes": ["audio"],
        "NSMicrophoneUsageDescription": "Not used",
        "NSNotificationsUsageDescription": "We need to send you alarm notifications"
      }
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": ["./assets/sounds/alarm.mp3"]
        }
      ]
    ]
  }
}
```

---

## Installing on Personal iPhone (No App Store)

### Option 1: Expo Go (Quick Testing)
- Install "Expo Go" from App Store
- Run `npm start` in project
- Scan QR code with iPhone camera
- **Limitation:** Some native features may not work fully

### Option 2: EAS Build (Recommended)
- Free tier available (limited builds per month)
- Creates actual installable app
- Full native functionality

```bash
# Install EAS CLI
npm install -g eas-cli

# Create Expo account (free)
eas login

# Configure project
eas build:configure

# Build for iOS simulator (free)
eas build --platform ios --profile development

# Build for device (requires Apple Developer account OR adhoc signing)
eas build --platform ios --profile preview
```

### Option 3: Direct Xcode Build (Free, More Complex)
- Generate native iOS project
- Open in Xcode
- Sign with personal Apple ID (free)
- Deploy directly to connected iPhone

```bash
# Generate native project
npx expo prebuild

# Open in Xcode
open ios/alarmpuzzleapp.xcworkspace

# In Xcode:
# 1. Connect iPhone via USB
# 2. Select your device as target
# 3. Sign with personal Apple ID (Settings → Accounts)
# 4. Click "Run" button
```

---

## Future Enhancements (v2+)

### Puzzle Integration Architecture
- Create `PuzzleService` abstraction
- Define `Puzzle` interface with `verify()` method
- Puzzle types: Math, Pattern, Shake, Memory
- Replace dismiss button with puzzle screen

### Additional Features
- Multiple alarms with list view
- Recurring alarm schedules
- Snooze with configurable duration
- Custom alarm sounds/music
- Gradual volume increase
- Statistics (how long to solve puzzle, success rate)
- iCloud sync for alarm data

### Code Structure for Extensibility
```typescript
interface PuzzleType {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  verify(answer: any): boolean;
  render(): React.ReactNode;
}

// Easy to add new puzzle types
const mathPuzzle: PuzzleType = { ... };
const shakePuzzle: PuzzleType = { ... };
```

---

## Testing Strategy

### Simulator Testing
- Quick iteration during development
- Test UI/UX flows
- Debug notification scheduling
- Verify time picker behavior

### Physical Device Testing
- Required for testing actual alarm sounds
- Test background notification delivery
- Verify silent mode override works
- Test with device locked/unlocked
- Test after phone restart

### Edge Cases to Test
- Set alarm for 1 minute in future
- Set alarm while app is closed
- Change timezone with alarm set
- Phone restart with alarm scheduled
- Multiple alarm dismissals
- App force quit scenario
- Low battery mode
- Do Not Disturb mode

---

## Known Limitations

1. **iOS Restrictions:**
   - Cannot guarantee alarm fires if phone is off
   - Background execution is limited
   - Notification delivery may be delayed if battery saver is on

2. **React Native Constraints:**
   - Slightly larger app size than native Swift
   - Some native iOS features require custom modules

3. **Free Developer Account Limits:**
   - Apps expire after 7 days (need to reinstall)
   - Limited to 3 apps on device at once
   - Cannot use TestFlight

4. **v1 Limitations:**
   - Only one alarm at a time
   - No recurring schedules
   - Basic UI

---

## Resources

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [iOS Background Modes](https://developer.apple.com/documentation/xcode/configuring-background-execution-modes)

### Tutorials
- [React Native Alarm App Tutorial](https://www.youtube.com/results?search_query=react+native+alarm+app)
- [Expo Notifications Guide](https://docs.expo.dev/push-notifications/overview/)

### Community
- [React Native Discord](https://discord.com/invite/react-native)
- [Expo Discord](https://chat.expo.dev/)
- [Stack Overflow - react-native tag](https://stackoverflow.com/questions/tagged/react-native)

---

## Timeline Estimate

**Total: 7-10 days** (assuming 2-3 hours per day)

- Environment setup: 1-2 days
- Core functionality: 2-3 days
- UI development: 1-2 days
- Testing & refinement: 2-3 days
- Device installation: 1 day

**Fast track:** Could be done in 3-4 days with full-time focus.

---

## Next Steps

1. ✅ Review this plan and confirm approach
2. [ ] Install Xcode and development tools
3. [ ] Initialize Expo project with dependencies
4. [ ] Set up iOS simulator
5. [ ] Start Phase 2: Core alarm logic implementation

---

## Questions or Modifications?

This plan assumes:
- You're comfortable with JavaScript/TypeScript
- Basic React knowledge
- Willing to learn React Native patterns
- Can dedicate time over 1-2 weeks

Let me know if you want to adjust the scope, timeline, or approach!
