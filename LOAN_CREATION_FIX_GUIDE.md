# 🔧 Loan Creation Fix - Complete Diagnostic & Solution

## 🎯 Root Causes Identified

### Issue 1: Session Not Persisting on Web
**Problem:** App loads with `user: null` and `INITIAL_SESSION: true`
**Cause:** Session restoration from AsyncStorage not working on web platform
**Impact:** `supabase.auth.getUser()` returns null, RLS blocks insert

### Issue 2: OAuth Callback Not Handling Properly
**Problem:** "Not on callback route, skipping OAuth handling"
**Cause:** Web redirect URL doesn't match Supabase callback configuration
**Impact:** Session not established after OAuth login

### Issue 3: Missing Environment Variables
**Problem:** `supabase is not defined` in console
**Cause:** `EXPO_PUBLIC_SUPABASE_URL` or `EXPO_PUBLIC_SUPABASE_ANON_KEY` not set
**Impact:** Supabase client not initialized

---

## ✅ FIXES TO APPLY

### Fix 1: Set Environment Variables

Create `.env.local` file in project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy URL and anon key

### Fix 2: Update Supabase Config for Web

The current config uses AsyncStorage which doesn't work on web. We need to detect platform and use appropriate storage.

**File:** `src/config/supabase.ts`

Replace with platform-aware storage:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Use localStorage on web, AsyncStorage on native
const storage = typeof window !== 'undefined' 
  ? {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
        return Promise.resolve();
      },
    }
  : AsyncStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
```

### Fix 3: Update Supabase Redirect URL

**In Supabase Dashboard:**
1. Go to Authentication → URL Configuration
2. Add redirect URL: `http://localhost:8081`
3. For production: `https://your-domain.com`

### Fix 4: Add Session Recovery on App Load

**File:** `App.tsx`

Add session recovery before initialization:

```typescript
useEffect(() => {
  const recoverSession = async () => {
    try {
      console.log('🔍 Attempting to recover session...');
      
      // Try to get existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session recovery error:', error);
      } else if (session) {
        console.log('✅ Session recovered:', session.user.email);
      } else {
        console.log('ℹ️ No existing session');
      }
    } catch (err) {
      console.error('❌ Error recovering session:', err);
    }
  };

  recoverSession();
  initialize();
}, [initialize]);
```

### Fix 5: Add Debug Logging to Loan Creation

**File:** `src/store/loanStore.ts`

Update createLoan function:

```typescript
createLoan: async (loanData) => {
  try {
    set({ loading: true });
    console.log('📝 Starting loan creation...');

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 Current user:', user?.email);
    console.log('❌ User error:', userError);
    
    if (!user) {
      throw new Error('User not authenticated - session may have expired');
    }

    console.log('📤 Inserting loan with user_id:', user.id);
    console.log('📋 Loan data:', loanData);

    const data = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('loans')
        .insert([{ ...loanData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('❌ Insert error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        throw error;
      }
      return data;
    }, { maxRetries: 3, delayMs: 1000 });

    console.log('✅ Loan created:', data);
    set((state) => ({
      loans: [data, ...state.loans],
    }));

    get().calculateDashboardMetrics();
    return data;
  } catch (error) {
    console.error('❌ Loan creation failed:', error);
    throw error;
  } finally {
    set({ loading: false });
  }
}
```

---

## 🧪 Testing Checklist

### Step 1: Verify Environment
- [ ] `.env.local` file created with Supabase credentials
- [ ] `EXPO_PUBLIC_SUPABASE_URL` is set
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` is set

### Step 2: Verify Supabase Config
- [ ] Redirect URL added to Supabase dashboard
- [ ] URL matches your dev server (http://localhost:8081)

### Step 3: Test Session Recovery
1. Open browser console (F12)
2. Refresh page
3. Look for: "✅ Session recovered" or "ℹ️ No existing session"
4. Check if `user` is not null in AppNavigator logs

### Step 4: Test Login
1. Go to Login screen
2. Sign in with email/password
3. Check console for: "✅ Session established successfully!"
4. Should redirect to Dashboard

### Step 5: Test Loan Creation
1. Go to Create Loan
2. Fill all fields
3. Click Create Loan
4. Check console for:
   - "📝 Starting loan creation..."
   - "👤 Current user: your-email@example.com"
   - "✅ Loan created: {...}"
5. Should show success alert and go back

---

## 🔍 Debugging Commands

In browser console (F12 → Console):

```javascript
// Check if Supabase is initialized
console.log(window.supabase);

// Check localStorage
console.log(localStorage.getItem('sb-auth-token'));

// Check current session
const { data } = await supabase.auth.getSession();
console.log('Current session:', data);

// Check current user
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Check if user profile exists
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single();
console.log('User profile:', profile);
```

---

## 📊 Expected Console Output

### After Login
```
✅ Session established successfully!
User: your-email@example.com
Auth state change: SIGNED_IN {...}
```

### After Loan Creation
```
📝 Starting loan creation...
👤 Current user: your-email@example.com
📤 Inserting loan with user_id: abc-123-def
✅ Loan created: {id: "xyz", borrower_name: "John", ...}
```

---

## 🚨 Common Errors & Solutions

### Error: "User not authenticated"
**Cause:** Session not restored
**Solution:** Check `.env.local` and Supabase redirect URL

### Error: "new row violates row-level security policy"
**Cause:** user_id is null or doesn't match auth.uid()
**Solution:** Verify user is logged in and user profile exists

### Error: "SUPABASE_URL is YOUR_SUPABASE_URL"
**Cause:** Environment variables not loaded
**Solution:** Create `.env.local` and restart dev server

---

## 🎯 Next Steps

1. Create `.env.local` with Supabase credentials
2. Update `src/config/supabase.ts` with platform-aware storage
3. Update `App.tsx` with session recovery
4. Update `src/store/loanStore.ts` with debug logging
5. Restart dev server
6. Test login and loan creation
7. Check console for success messages

---

**Once these fixes are applied, loan creation should work!** ✅

