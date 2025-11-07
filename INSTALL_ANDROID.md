# How to Install Loan App on Android Emulator

Your emulator is **already connected**! ✅ (`emulator-5554`)

---

## Method 1: Development Mode (Easiest - Recommended)

This method runs the app directly from your development server:

### Steps:
1. **Make sure your Expo server is running** (the terminal where you ran `npm start`)
2. **In that terminal, press `a`** (lowercase 'a')
3. The app will automatically:
   - Build the Android bundle
   - Install it on the emulator
   - Launch the app

### What happens:
- Expo builds the app for Android
- Installs via ADB to your emulator
- Opens the app automatically
- **Note:** This installs in development mode, so it requires the Expo server to be running

---

## Method 2: Direct Command (Alternative)

If pressing `a` doesn't work, you can run:

```powershell
npm run android
```

This does the same thing as pressing `a` in the Expo terminal.

---

## Method 3: Build Standalone APK (For Permanent Installation)

If you want to install a standalone APK that doesn't require the Expo server:

### Option A: Development Build (Quick)

1. **Build the APK:**
   ```powershell
   npx expo run:android
   ```

2. **Wait for build to complete** (5-10 minutes first time)
3. The APK will be automatically installed on your emulator
4. The app will launch automatically

### Option B: Production APK (EAS Build - Recommended for distribution)

1. **Install EAS CLI:**
   ```powershell
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```powershell
   eas login
   ```

3. **Configure EAS:**
   ```powershell
   eas build:configure
   ```

4. **Build Android APK:**
   ```powershell
   eas build --platform android --profile preview
   ```

5. **Wait for build** (10-15 minutes, builds in the cloud)
6. **Download the APK** from the provided link
7. **Install APK manually:**
   ```powershell
   adb install path/to/your-app.apk
   ```

---

## Quick Installation (Right Now!)

Since your emulator is already running, just do this:

1. **Go to your Expo terminal** (where `npm start` is running)
2. **Press `a`**
3. **Wait 30-60 seconds** for the app to build and install
4. **Done!** The app will open on your emulator

---

## Verify Installation

After installation, you can verify the app is installed:

```powershell
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
& "$sdkPath\platform-tools\adb.exe" shell pm list packages | Select-String "loan"
```

You should see: `package:com.loanapp` or similar.

---

## Troubleshooting

### "No Android device found"
- Make sure emulator is fully booted (Android home screen visible)
- Run: `adb devices` - should show `emulator-5554 device`
- Restart Expo: Press `Ctrl+C`, then `npm start` again

### "Build failed"
- Make sure you're in the project directory
- Check that all dependencies are installed: `npm install`
- Clear cache: `npx expo start -c`

### App installs but crashes
- Check emulator console for errors
- Verify Supabase credentials in `.env` file
- Make sure Supabase database schema is set up

### APK installation fails
- Make sure emulator has enough storage
- Enable "Install from unknown sources" in emulator settings
- Try: `adb install -r your-app.apk` (force reinstall)

---

## Current Status

✅ **Emulator:** Running (`emulator-5554`)  
✅ **ADB:** Connected  
✅ **Expo Server:** Running (assuming `npm start` is active)  
⏳ **App:** Ready to install (just press `a`!)

---

## Next Steps After Installation

1. **Test the app:**
   - Sign in with phone number or Google
   - Create a test loan
   - Record a repayment

2. **Check Supabase connection:**
   - Make sure you've run `supabase/schema.sql` in Supabase dashboard
   - Verify credentials in `.env` file

3. **Test features:**
   - Dashboard
   - Loan creation
   - Repayment tracking
   - Search and filters

---

**TL;DR: Just press `a` in your Expo terminal and wait 30-60 seconds!** 🚀

