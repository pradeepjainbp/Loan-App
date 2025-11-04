# Loan App - Complete Setup Guide

This guide will walk you through setting up the Loan App from scratch, including Supabase configuration and running the app on different platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Project Setup](#project-setup)
4. [Running the App](#running-the-app)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Optional (for mobile development)
- **Android Studio** - For Android development
- **Xcode** - For iOS development (macOS only)
- **Expo Go app** - For testing on physical devices

### Accounts Needed
- **Supabase account** - [Sign up](https://supabase.com) (free tier available)
- **Google Cloud account** - For Google OAuth (optional)

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the details:
   - **Name**: loan-app (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (2-3 minutes)

### Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open the file `supabase/schema.sql` from this project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click "Run" to execute the SQL
7. You should see a success message

**What this does:**
- Creates all necessary tables (users, loans, repayments, reminders, attachments)
- Sets up Row-Level Security (RLS) policies for data privacy
- Creates indexes for better performance
- Sets up triggers for automatic timestamps
- Creates a function to auto-create user profiles on signup

### Step 3: Configure Authentication

#### Enable Google OAuth (Optional)

1. Go to **Authentication** > **Providers** in Supabase
2. Find "Google" and click to expand
3. Toggle "Enable Sign in with Google"
4. You'll need to set up Google OAuth credentials:

   **Setting up Google OAuth:**
   a. Go to [Google Cloud Console](https://console.cloud.google.com)
   b. Create a new project or select an existing one
   c. Go to "APIs & Services" > "Credentials"
   d. Click "Create Credentials" > "OAuth 2.0 Client ID"
   e. Configure the consent screen if prompted
   f. Choose "Web application" as application type
   g. Add authorized redirect URIs:
      - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
      - Replace `[YOUR-PROJECT-REF]` with your Supabase project reference
   h. Copy the Client ID and Client Secret
   i. Paste them into Supabase Google provider settings
   j. Click "Save"

#### Enable Phone Authentication

1. Go to **Authentication** > **Providers** in Supabase
2. Find "Phone" and click to expand
3. Toggle "Enable Phone Sign-Up"
4. Choose an SMS provider:
   - **Twilio** (recommended for production)
   - **MessageBird**
   - Or use Supabase's built-in provider (limited free tier)
5. Configure your SMS provider credentials
6. Click "Save"

**Note:** For development, you can use Supabase's built-in SMS provider which includes some free credits.

### Step 4: Get Your API Credentials

1. Go to **Settings** > **API** in Supabase
2. You'll need two values:
   - **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`
3. Keep these handy for the next step

### Step 5: Configure Storage (Optional - for attachments)

1. Go to **Storage** in Supabase
2. Click "Create a new bucket"
3. Name it `loan-attachments`
4. Set it to **Private** (not public)
5. Click "Create bucket"
6. Go to "Policies" tab
7. Add policies to allow authenticated users to upload/view their own files

---

## Project Setup

### Step 1: Install Dependencies

The dependencies should already be installed, but if not:

```bash
cd loan-app
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in a text editor

3. Add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. Save the file

**Important:** Never commit the `.env` file to version control. It's already in `.gitignore`.

### Step 3: Verify Configuration

1. Open `src/config/supabase.ts`
2. Verify that it's reading from environment variables
3. The file should look like this:
   ```typescript
   const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
   ```

---

## Running the App

### Start the Development Server

```bash
npm start
```

This will start the Expo development server and show a QR code.

### Run on Web

**Option 1:** Press `w` in the terminal

**Option 2:** Run directly:
```bash
npm run web
```

The app will open in your default browser at `http://localhost:8081`

### Run on Android

**Option 1: Using Android Emulator**
1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Start the emulator
4. Press `a` in the terminal or run:
   ```bash
   npm run android
   ```

**Option 2: Using Physical Device**
1. Install "Expo Go" app from Google Play Store
2. Scan the QR code shown in the terminal
3. The app will load on your device

### Run on iOS

**Option 1: Using iOS Simulator (macOS only)**
1. Install Xcode from the Mac App Store
2. Install Xcode Command Line Tools
3. Press `i` in the terminal or run:
   ```bash
   npm run ios
   ```

**Option 2: Using Physical Device**
1. Install "Expo Go" app from the App Store
2. Scan the QR code shown in the terminal
3. The app will load on your device

---

## Testing

### Test Authentication

1. Open the app
2. Try signing in with Google (if configured)
3. Try signing in with phone number (if configured)
4. Verify that you're redirected to the dashboard after successful login

### Test Loan Creation

1. Click "Add New Loan"
2. Fill in the required fields:
   - Borrower name
   - Principal amount
   - Start date
   - Due date
3. Optionally add interest
4. Click "Create Loan"
5. Verify the loan appears in the dashboard and loans list

### Test Repayment

1. Open a loan from the list
2. Click "Record Repayment"
3. Enter payment details
4. Submit
5. Verify the repayment appears in the loan detail view
6. Verify the outstanding balance is updated

### Test Real-time Sync

1. Open the app on two different devices/browsers
2. Sign in with the same account on both
3. Create a loan on one device
4. Verify it appears on the other device within a few seconds

---

## Deployment

### Deploy Web Version

1. Build the web version:
   ```bash
   npx expo export:web
   ```

2. The build output will be in the `web-build` directory

3. Deploy to a hosting service:
   - **Vercel**: `vercel deploy`
   - **Netlify**: Drag and drop the `web-build` folder
   - **GitHub Pages**: Push to a gh-pages branch

### Build Android APK

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure EAS:
   ```bash
   eas build:configure
   ```

3. Build for Android:
   ```bash
   eas build --platform android
   ```

4. Download the APK from the provided link

### Build iOS App

1. Build for iOS (requires Apple Developer account):
   ```bash
   eas build --platform ios
   ```

2. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

---

## Troubleshooting

### Issue: "Network request failed"
- **Solution**: Check your internet connection and verify Supabase URL is correct

### Issue: "Invalid API key"
- **Solution**: Verify your `EXPO_PUBLIC_SUPABASE_ANON_KEY` is correct in `.env`

### Issue: "Row Level Security policy violation"
- **Solution**: Make sure you ran the complete `schema.sql` file in Supabase

### Issue: App won't start
- **Solution**: 
  1. Clear Expo cache: `npx expo start -c`
  2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Issue: Authentication not working
- **Solution**: 
  1. Verify authentication providers are enabled in Supabase
  2. Check that redirect URLs are correctly configured
  3. Clear browser cache and cookies

---

## Next Steps

After successful setup:

1. **Customize the app** - Modify colors, branding, etc.
2. **Add more features** - Refer to the "Future Enhancements" section in README
3. **Set up analytics** - Integrate analytics tools
4. **Configure push notifications** - Set up Firebase Cloud Messaging
5. **Add tests** - Write unit and integration tests

---

## Support

If you encounter any issues:

1. Check the [README.md](README.md) for common solutions
2. Review Supabase documentation: https://supabase.com/docs
3. Check Expo documentation: https://docs.expo.dev
4. Open an issue on GitHub

---

**Congratulations!** 🎉 You've successfully set up the Loan App. Happy coding!

