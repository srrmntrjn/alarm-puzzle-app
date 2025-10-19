# Alarm App Implementation Plan

## Overview
A React Native alarm app with snooze functionality, alarm history tracking, and recurring schedules. Built with Expo SDK 54 for iOS.

## Data Model

### Alarm Interface
```typescript
interface Alarm {
  id: string;
  time: { hour: number; minute: number }; // 24-hour format
  label: string;
  schedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  enabled: boolean;
  createdAt: Date;
  snoozeSettings: {
    duration: number; // minutes (e.g., 5, 10, 15)
  };
  history: AlarmTriggerEvent[];
}

interface AlarmTriggerEvent {
  id: string;
  triggeredAt: Date;
  snoozeCount: number;
  dismissedAt: Date | null;
  status: 'snoozed' | 'dismissed' | 'active';
}
```

## Screens/Components

### 1. Home Screen (Alarm List)
- Shows all alarms sorted by time (earliest first)
- Each alarm displays:
  - Time (e.g., "4:00 AM")
  - Label (e.g., "Work Alarm")
  - Schedule (e.g., "M-F", "Daily", "M W F")
  - On/Off toggle
- Empty state when no alarms ("No alarms yet, create one!")
- Floating "+" button to create new alarm
- Swipe to delete alarm
- Tap alarm to view details/history

### 2. Alarm Detail Screen
- Shows alarm configuration:
  - Time, label, schedule, enabled status
- Edit button to modify alarm
- History section showing recent triggers:
  - Date/time triggered
  - Number of snoozes for that event
  - Final dismiss time
- Delete alarm option
- Keep last 30 days or 50 events (whichever comes first)

### 3. Create/Edit Alarm Screen
- Time picker (hours & minutes)
- Text input for label/name
- Day selector with preset templates:
  - Quick presets: "Weekdays" (M-F), "Weekends" (Sa-Su), "Daily" (all days)
  - Custom: Individual checkboxes for M, T, W, Th, F, Sa, Su
- Snooze duration selector (5, 10, 15 minutes) - per alarm
- Save button
- Cancel button

### 4. Alarm Trigger Screen (Full-screen overlay when alarm goes off)
- Shows alarm time & label
- Shows current snooze count (e.g., "Snoozed 2 times")
- Plays sound continuously (even in silent mode)
- Large Snooze button (primary action)
- Dismiss button (secondary - will become puzzle in v2)
- Max 5 snoozes per alarm trigger

## File Structure

```
alarm-puzzle-app/
├── app/
│   ├── index.tsx                 # Home screen (Alarm List)
│   ├── alarm/[id].tsx           # Alarm Detail screen
│   ├── create-alarm.tsx         # Create/Edit Alarm screen
│   ├── trigger-alarm.tsx        # Alarm Trigger screen (full-screen)
│   └── _layout.tsx              # Root layout
├── components/
│   ├── AlarmListItem.tsx        # Individual alarm in list
│   ├── TimePicker.tsx           # Time selection component
│   ├── DaySelector.tsx          # Day of week selector
│   ├── SchedulePresets.tsx      # Weekday/Weekend/Daily presets
│   ├── EmptyState.tsx           # Empty alarm list state
│   └── HistoryItem.tsx          # History event display
├── services/
│   ├── storageService.ts        # AsyncStorage CRUD operations
│   ├── notificationService.ts   # Local notification scheduling
│   ├── alarmService.ts          # Business logic for alarms
│   └── soundService.ts          # Audio playback handling
├── hooks/
│   ├── useAlarms.ts             # Alarm state management
│   ├── useAlarmTrigger.ts       # Active alarm state
│   └── useNotifications.ts      # Notification permissions
├── types/
│   └── alarm.ts                 # TypeScript interfaces
├── constants/
│   └── Colors.ts                # Theme colors
├── assets/
│   └── sounds/
│       └── alarm.mp3            # Default alarm sound
└── utils/
    ├── scheduleHelper.ts        # Schedule formatting utilities
    └── timeHelper.ts            # Time formatting utilities
```

## Implementation Phases

### Phase 1: Data & Storage Layer ✓
**Goal:** Set up TypeScript types and local storage infrastructure

- [ ] Create type definitions in `types/alarm.ts`
- [ ] Implement `storageService.ts` with AsyncStorage
  - [ ] `getAlarms()` - Load all alarms
  - [ ] `saveAlarm(alarm)` - Create/update alarm
  - [ ] `deleteAlarm(id)` - Remove alarm
  - [ ] `addHistoryEvent(alarmId, event)` - Track trigger
- [ ] Create `useAlarms()` hook for state management
- [ ] Test CRUD operations

### Phase 2: Alarm List Screen ✓
**Goal:** Display alarms and basic navigation

- [ ] Build `AlarmListItem.tsx` component
  - [ ] Display time, label, schedule
  - [ ] On/off toggle
  - [ ] Tap to navigate to detail
- [ ] Build `EmptyState.tsx` component
- [ ] Implement home screen (`app/index.tsx`)
  - [ ] List all alarms sorted by time
  - [ ] Swipe to delete
  - [ ] Floating "+" button
- [ ] Add navigation to create screen

### Phase 3: Create/Edit Alarm Screen ✓
**Goal:** Allow users to create and modify alarms

- [ ] Build `TimePicker.tsx` component
- [ ] Build `SchedulePresets.tsx` (Weekdays/Weekends/Daily)
- [ ] Build `DaySelector.tsx` (individual day checkboxes)
- [ ] Build snooze duration picker
- [ ] Implement `app/create-alarm.tsx`
  - [ ] Label text input
  - [ ] All form components
  - [ ] Validation
  - [ ] Save/cancel logic
- [ ] Navigate back to list after save

### Phase 4: Alarm Detail Screen ✓
**Goal:** Show alarm configuration and history

- [ ] Build `HistoryItem.tsx` component
- [ ] Implement `app/alarm/[id].tsx`
  - [ ] Display alarm details
  - [ ] Show history list (last 30 days/50 events)
  - [ ] Edit button → navigate to edit mode
  - [ ] Delete alarm option
- [ ] Add utility functions for formatting history

### Phase 5: Notifications Setup ✓
**Goal:** Schedule local notifications for alarms

- [ ] Implement `notificationService.ts`
  - [ ] Request permissions
  - [ ] Schedule notifications based on schedule
  - [ ] Cancel notifications when disabled/deleted
  - [ ] Re-schedule after snooze
- [ ] Implement `useNotifications()` hook
- [ ] Handle app restart (re-schedule all enabled alarms)
- [ ] Configure app.json for notifications
  - [ ] iOS notification permissions
  - [ ] Background modes

### Phase 6: Alarm Trigger Experience ✓
**Goal:** Full-screen alarm with snooze/dismiss

- [ ] Implement `soundService.ts`
  - [ ] Play alarm sound on loop
  - [ ] Configure audio to play in silent mode
  - [ ] Stop sound
- [ ] Add default alarm sound to `assets/sounds/`
- [ ] Build `app/trigger-alarm.tsx`
  - [ ] Full-screen overlay
  - [ ] Display alarm info
  - [ ] Show snooze count
  - [ ] Large snooze button
  - [ ] Dismiss button
  - [ ] Max 5 snoozes enforcement
- [ ] Implement `useAlarmTrigger()` hook
  - [ ] Track active alarm
  - [ ] Increment snooze counter
  - [ ] Save trigger event to history
- [ ] Handle notification tap → open trigger screen
- [ ] Schedule snooze notification

### Phase 7: Utilities & Helpers ✓
**Goal:** Formatting and display helpers

- [ ] Implement `scheduleHelper.ts`
  - [ ] Format schedule display (M-F, Daily, etc.)
  - [ ] Calculate next alarm time
- [ ] Implement `timeHelper.ts`
  - [ ] Format time display (12-hour format)
  - [ ] Compare times for sorting
- [ ] Add helper for history retention logic

### Phase 8: Polish & Edge Cases ✓
**Goal:** Handle edge cases and improve UX

- [ ] Dark mode styling
- [ ] Handle timezone changes
- [ ] Test background notification delivery
- [ ] Test app restart scenarios
- [ ] Handle edge cases:
  - [ ] Deleting alarm while it's ringing
  - [ ] Disabling alarm while snoozed
  - [ ] Multiple alarms at same time
  - [ ] Low battery mode
  - [ ] Do Not Disturb mode
- [ ] UI/UX refinements
- [ ] Add loading states
- [ ] Error handling

## Design Decisions

### Answered Questions
1. **Alarm sorting:** By time (earliest first)
2. **All days display:** Show as "Daily"
3. **Preset templates:** Yes - Weekdays, Weekends, Daily, Custom
4. **Alarm sound:** One default sound initially, add selection later
5. **Snooze duration:** Per-alarm setting (5, 10, or 15 minutes)
6. **Snooze limits:** Max 5 snoozes per alarm trigger
7. **History retention:** Last 30 days OR 50 events (whichever limit hit first)
8. **Button priority:** Snooze is primary (larger), Dismiss is secondary

### Technical Stack
- **Framework:** React Native with Expo SDK 54
- **Language:** TypeScript
- **Storage:** AsyncStorage
- **Notifications:** expo-notifications
- **Audio:** expo-av
- **Navigation:** Expo Router
- **State:** React hooks (useState, useEffect, custom hooks)

## Testing Strategy

### Key Scenarios to Test
1. Create alarm and verify it appears in list
2. Toggle alarm on/off
3. Edit existing alarm
4. Delete alarm
5. Alarm triggers at scheduled time
6. Snooze functionality and counter
7. Dismiss alarm and verify history saved
8. View alarm history
9. App restart with active alarms
10. Notification permissions
11. Silent mode override
12. Multiple alarms
13. Timezone changes

## Future Enhancements (v2+)
- Puzzle-based dismissal (math, pattern, shake, etc.)
- Custom alarm sounds/music
- Gradual volume increase
- Vibration patterns
- Statistics dashboard
- iCloud sync
- Widget support
- Apple Watch support
