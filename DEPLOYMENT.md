# Deployment Guide - Alarm Puzzle App

This guide explains how to deploy the app to your iPhone for testing with full notification support.

## Why You Need This

Expo Go has limitations with notifications - they don't work reliably. To test the full alarm functionality (notifications, sounds, snooze tracking), you need to build a development version of the app and install it directly on your iPhone.

---

## Prerequisites

- ✅ Mac computer with Xcode installed
- ✅ iPhone with USB cable
- ✅ Apple ID (free - no $99 Developer account needed for local testing)
- ✅ This project already set up

---

## One-Time Setup (Already Done)

These steps have already been completed for this project:

```bash
# Install expo-dev-client
npm install expo-dev-client --legacy-peer-deps

# Generate native iOS/Android projects
npx expo prebuild --clean
```

---

## Deploy to iPhone - Step by Step

### Step 1: Open Project in Xcode

```bash
open ios/alarmpuzzleapp.xcworkspace
```

**Important:** Open the `.xcworkspace` file, NOT the `.xcodeproj` file!

### Step 2: Connect Your iPhone

- Plug your iPhone into your Mac via USB cable
- Unlock your iPhone
- If prompted, tap "Trust This Computer" on your iPhone

### Step 3: Select Your Device in Xcode

- At the top of Xcode, next to the play/stop buttons, you'll see a device selector
- Click it and select your iPhone from the list (it should show your iPhone's name)

### Step 4: Configure Signing (FREE)

1. In Xcode's left sidebar, click the blue **"alarmpuzzleapp"** project icon
2. Under **TARGETS**, select **"alarmpuzzleapp"**
3. Click the **"Signing & Capabilities"** tab
4. Check the box: **"Automatically manage signing"**
5. Under **"Team"**:
   - If you see your Apple ID → Select it
   - If not → Click **"Add Account..."** and sign in with your Apple ID (any Apple ID works - free!)
6. **Change the Bundle Identifier** to something unique:
   - Example: `com.yourname.alarmpuzzleapp`
   - Or: `com.sriram.alarmpuzzleapp`
   - This must be unique (no one else can use it)

### Step 5: Trust Developer Certificate on iPhone

First time only, after building:

1. On your iPhone: **Settings** > **General** > **VPN & Device Management**
2. Under "Developer App", tap on your Apple ID
3. Tap **"Trust [Your Name]"**
4. Tap **"Trust"** again to confirm

### Step 6: Build and Run

1. In Xcode, press the **▶️ Play button** (or press `Cmd + R`)
2. Wait for the build to complete (first time takes 2-5 minutes)
3. The app will install and launch on your iPhone automatically
4. You should see a white screen with the Expo logo initially

### Step 7: Start Metro Bundler

Open a new terminal window and run:

```bash
npx expo start --dev-client
```

- The app on your phone will automatically connect
- You'll see your app load with all your screens!

---

## Daily Development Workflow

After the initial setup, your daily workflow is:

1. **Connect iPhone to Mac** (via USB)
2. **In Terminal:** `npx expo start --dev-client`
3. **Open the app** on your iPhone (it should be installed from Step 6)
4. The app connects to Metro and loads your latest code

You only need to rebuild in Xcode if:
- You install new native dependencies (npm packages)
- You modify `app.json` or native configuration
- The app expires (after 7 days with free account)

---

## Testing Notifications

With this setup, notifications will work properly! Test by:

1. Create an alarm
2. Tap "Test Alarm" to trigger it immediately
3. Or wait for the scheduled time
4. You'll get a real notification on your iPhone
5. Tap it to open the alarm screen
6. Test snooze and dismiss functionality

---

## Rebuilding After Changes

If you modify native code or install new packages:

```bash
# Clean and rebuild native projects
npx expo prebuild --clean

# Reopen in Xcode
open ios/alarmpuzzleapp.xcworkspace

# Build and run again (Cmd + R in Xcode)
```

---

## Important Notes

### Free Apple Developer Account Limitations

- ✅ **Free for local testing**
- ⚠️ **App expires after 7 days** - rebuild and reinstall from Xcode
- ⚠️ **Maximum 3 apps** on device at once with free account
- ⚠️ **Can't use TestFlight** without $99/year account

### Running Without USB Cable

After initial installation, you can disconnect USB:

1. Make sure iPhone and Mac are on **same WiFi network**
2. In Xcode: **Window** > **Devices and Simulators**
3. Select your iPhone, check **"Connect via network"**
4. Now you can build/run wirelessly!

### Troubleshooting

**"No code signing identities found"**
- Go to Xcode > Preferences > Accounts
- Make sure your Apple ID is added
- Click "Download Manual Profiles"

**"Unable to install [app name]"**
- Delete the app from your iPhone
- In Xcode: Product > Clean Build Folder (Cmd + Shift + K)
- Build again

**"Failed to verify code signature"**
- On iPhone: Settings > General > VPN & Device Management
- Trust your developer certificate

**Metro bundler won't connect**
- Make sure both devices are on same WiFi
- Try running: `npx expo start --dev-client --tunnel`
- Or restart Metro: `npx expo start --dev-client --clear`

---

## Production Deployment (Optional)

If you want to distribute via TestFlight or App Store later:

1. **Get Apple Developer Account** ($99/year)
2. **Use EAS Build:**
   ```bash
   npm install -g eas-cli
   eas login
   eas build --profile production --platform ios
   eas submit --platform ios
   ```

---

## Summary

**Quick Start:**
```bash
# 1. Open in Xcode
open ios/alarmpuzzleapp.xcworkspace

# 2. Build to your iPhone (Cmd + R in Xcode)

# 3. Start Metro
npx expo start --dev-client
```

**You now have:**
- ✅ Full notification support
- ✅ Background alarm triggering
- ✅ Real device testing
- ✅ Free local development

Enjoy testing your alarm app! 🎉
