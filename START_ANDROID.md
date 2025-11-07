# How to Run Loan App on Android Emulator

## Quick Steps

### Option 1: Start Emulator from Android Studio (Recommended)
1. Open **Android Studio**
2. Click on **Device Manager** (or Tools → Device Manager)
3. Find **Medium_Phone_API_36.0** in the list
4. Click the **Play button** (▶️) next to it
5. Wait for emulator to boot (2-3 minutes first time, 30-60 seconds after)
6. Once emulator is running, go back to your Expo terminal
7. Press **`a`** to open the app on Android

### Option 2: Start Emulator from Command Line
Run this command in a **new terminal window** (keep your Expo server running):
```powershell
cd "$env:LOCALAPPDATA\Android\Sdk\emulator"
.\emulator.exe -avd Medium_Phone_API_36.0
```

Then in your Expo terminal, press **`a`**

---

## After Emulator Starts

1. **Wait for emulator to fully boot** (you'll see the Android home screen)
2. **Go back to your Expo terminal** (where `npm start` is running)
3. **Press `a`** to launch the app
4. The app will install and open on the emulator automatically

---

## Troubleshooting

### Emulator won't start
- Make sure **Virtualization is enabled** in your BIOS
- Close other heavy applications (emulators need RAM)
- Try restarting Android Studio

### "No devices found" error
- Make sure emulator is fully booted (not just starting)
- Run: `adb devices` - you should see a device listed
- Restart the Expo server: Press `Ctrl+C`, then `npm start` again

### App won't install
- Make sure emulator has internet connection
- Check that Supabase credentials are correct in `.env`
- Look at emulator console for error messages

---

## Quick Reference

**Start Emulator:** Android Studio → Device Manager → Play button  
**Open App on Android:** Press `a` in Expo terminal  
**Check if device connected:** `adb devices`  
**SDK Location:** `C:\Users\PradeepJain\AppData\Local\Android\Sdk`

---

**Note:** The first emulator boot takes 2-3 minutes. Subsequent boots are faster (30-60 seconds).


