# 🚀 Setup Instructions - Loan App

## ✅ Prerequisites

- Node.js 16+ installed
- Supabase account (free at https://supabase.com)
- Git installed

---

## 📋 Step 1: Get Supabase Credentials

1. Go to https://app.supabase.com
2. Create a new project or select existing one
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Anon Public Key** (long string starting with `eyJ...`)

---

## 📝 Step 2: Create Environment File

1. In project root, create file: `.env.local`
2. Copy content from `.env.local.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace with your actual credentials from Step 1

---

## 🔐 Step 3: Configure Supabase Redirect URL

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add:
   - `http://localhost:8081` (for local development)
   - `http://localhost:3000` (if using different port)
   - `https://your-domain.com` (for production)

5. Click **Save**

---

## 🗄️ Step 4: Set Up Database

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy content from `supabase/schema.sql`
6. Paste into SQL editor
7. Click **Run**

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push schema
supabase db push
```

---

## 🔧 Step 5: Install Dependencies

```bash
# Install npm packages
npm install

# Or if using yarn
yarn install

# Or if using pnpm
pnpm install
```

---

## 🚀 Step 6: Start Development Server

```bash
# Start Expo dev server
npm start

# Or for web specifically
npm run web

# Or using Expo CLI
expo start --web
```

This will start the app at `http://localhost:8081`

---

## 🧪 Step 7: Test the App

### Test 1: Check Supabase Connection
1. Open browser console (F12)
2. Run:
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```
3. Should show session or null (not error)

### Test 2: Sign Up
1. Go to app at http://localhost:8081
2. Click "Sign Up"
3. Enter email and password
4. Click "Create Account"
5. Should redirect to Dashboard

### Test 3: Create Loan
1. Click "Create Loan" button
2. Fill in:
   - I am: Lender
   - Borrower Name: John Doe
   - Principal: 10000
   - Start Date: Today
   - Due Date: Next month
3. Click "Create Loan"
4. Should show success message
5. Loan should appear in list

---

## 🐛 Troubleshooting

### Issue: "SUPABASE_URL is YOUR_SUPABASE_URL"

**Cause:** Environment variables not loaded

**Solution:**
1. Check `.env.local` exists in project root
2. Restart dev server: `npm start`
3. Clear browser cache: Ctrl+Shift+Delete

### Issue: "User not authenticated"

**Cause:** Session not restored

**Solution:**
1. Check `.env.local` has correct credentials
2. Check Supabase redirect URL includes `http://localhost:8081`
3. Sign in again
4. Check browser console for errors

### Issue: "new row violates row-level security policy"

**Cause:** RLS policy blocking insert

**Solution:**
1. Go to Supabase dashboard
2. Go to **Authentication** → **Policies**
3. Check "Users can insert own loans" policy exists
4. If missing, run `supabase/schema.sql` again

### Issue: "Cannot find module '@supabase/supabase-js'"

**Cause:** Dependencies not installed

**Solution:**
```bash
npm install
npm start
```

---

## 📊 Database Schema

The app uses these tables:

- **users** - User profiles and settings
- **loans** - Loan records
- **repayments** - Repayment records
- **reminders** - Loan reminders
- **attachments** - Loan attachments

All tables have Row Level Security (RLS) enabled. Users can only see their own data.

---

## 🔐 Security Notes

- Never commit `.env.local` to Git
- `.env.local` is in `.gitignore`
- Anon key is public (safe to expose)
- Service role key is secret (never expose)
- RLS policies protect data access

---

## 📱 Running on Mobile

### iOS (Mac only)
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web
```bash
npm run web
```

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12 → Console)
2. Check Supabase logs (Dashboard → Logs → API)
3. Check `.env.local` has correct credentials
4. Restart dev server
5. Clear browser cache

---

## ✅ Verification Checklist

- [ ] `.env.local` created with Supabase credentials
- [ ] Supabase redirect URL configured
- [ ] Database schema applied
- [ ] Dependencies installed
- [ ] Dev server running
- [ ] Can sign up
- [ ] Can create loan
- [ ] Loan appears in list

---

**Setup complete!** 🎉

