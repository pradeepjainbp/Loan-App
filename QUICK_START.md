# Loan App - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js installed (v16+)
- A Supabase account (free at https://supabase.com)

## Step 1: Install Dependencies (1 minute)

```bash
cd loan-app
npm install
```

## Step 2: Set Up Supabase (2 minutes)

### Create Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in details and create

### Set Up Database
1. Go to SQL Editor in Supabase
2. Copy contents of `supabase/schema.sql`
3. Paste and click "Run"

### Enable Authentication
1. Go to Authentication > Providers
2. Enable "Phone" (use built-in provider for testing)
3. Optionally enable "Google" (requires Google OAuth setup)

### Get Credentials
1. Go to Settings > API
2. Copy your Project URL
3. Copy your anon/public key

## Step 3: Configure Environment (1 minute)

```bash
# Copy example file
cp .env.example .env

# Edit .env and add your credentials
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Run the App (1 minute)

```bash
npm start
```

Then press:
- `w` for web browser
- `a` for Android (requires Android Studio)
- `i` for iOS (requires macOS and Xcode)

## First Time Using the App

1. **Sign In**
   - Use phone number + OTP (or Google if configured)
   - You'll be redirected to the dashboard

2. **Create Your First Loan**
   - Click "Add New Loan"
   - Fill in:
     - Borrower name: "John Doe"
     - Amount: 1000
     - Start date: Today
     - Due date: 30 days from now
   - Click "Create Loan"

3. **Record a Repayment**
   - Click on the loan you just created
   - Click "Record Repayment"
   - Enter amount: 500
   - Click "Record Repayment"
   - See the balance update!

## Common Commands

```bash
# Start development server
npm start

# Run on web
npm run web

# Run on Android
npm run android

# Run on iOS
npm run ios

# Clear cache and restart
npx expo start -c
```

## Troubleshooting

### "Supabase URL not configured"
- Make sure you created `.env` file
- Restart the Expo server after adding environment variables

### "Authentication failed"
- Check that Phone auth is enabled in Supabase
- Verify your Supabase credentials are correct

### App won't start
```bash
# Clear cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Next Steps

- Read [README.md](README.md) for full documentation
- Read [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
- Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for technical details

## Need Help?

- Check the documentation files
- Review Supabase docs: https://supabase.com/docs
- Review Expo docs: https://docs.expo.dev

---

**That's it!** You should now have a working loan tracking app. 🎉

