# 🔧 Troubleshooting Loan Creation Issues

## 🎯 Quick Diagnosis

### Step 1: Check Browser Console (F12)
1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Try to create a loan
4. Look for error messages
5. **Copy the full error message**

### Step 2: Common Errors & Solutions

---

## ❌ Error 1: "User not authenticated"

**Cause:** You're not logged in or session expired

**Solution:**
1. Go to Login screen
2. Sign in with your email/password
3. Try creating loan again

**Check:**
```javascript
// In browser console, run:
localStorage.getItem('sb-auth-token')
// If empty → not logged in
// If has value → logged in
```

---

## ❌ Error 2: "new row violates row-level security policy"

**Cause:** RLS policy not allowing insert

**Solution:**
1. Go to Supabase Dashboard
2. Go to **Authentication** → **Policies**
3. Check if "Users can insert own loans" policy exists
4. If missing, run this SQL in Supabase SQL Editor:

```sql
CREATE POLICY "Users can insert own loans"
  ON public.loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## ❌ Error 3: "null value in column violates not-null constraint"

**Cause:** Missing required field

**Solution:**
1. Check all fields are filled:
   - [ ] Borrower Name (required)
   - [ ] Principal Amount (required)
   - [ ] Start Date (required)
   - [ ] Due Date (required)

2. In browser console, check what's being sent:
```javascript
// Look for: "Creating loan with data:"
// Check if any field is null or undefined
```

---

## ❌ Error 4: "invalid input syntax for type numeric"

**Cause:** Principal amount is not a valid number

**Solution:**
1. Make sure Principal Amount is a number
2. Don't include currency symbol
3. Example: `10000` (not `₹10000`)

---

## ❌ Error 5: "insert or update on table violates foreign key constraint"

**Cause:** User profile doesn't exist in database

**Solution:**
1. Go to Supabase Dashboard
2. Go to **SQL Editor**
3. Run this query:

```sql
SELECT * FROM public.users WHERE id = auth.uid();
```

4. If no results, your user profile wasn't created
5. Create it manually:

```sql
INSERT INTO public.users (id, full_name, email, settings)
VALUES (
  auth.uid(),
  'Your Name',
  auth.email(),
  '{
    "currency": "INR",
    "date_format": "DD-MMM-YYYY",
    "default_interest_type": "none",
    "default_compounding_frequency": "monthly",
    "default_reminder_days": 7,
    "notifications_enabled": true,
    "email_notifications_enabled": true,
    "theme": "system"
  }'::jsonb
);
```

---

## ❌ Error 6: "CORS error" or "Network error"

**Cause:** Network connectivity issue

**Solution:**
1. Check internet connection
2. Refresh the page
3. Try again
4. Check if Supabase is down: https://status.supabase.com

---

## 🔍 Advanced Debugging

### Check Supabase Logs
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Logs** → **API**
4. Look for recent errors
5. Check the error details

### Check Database
1. Go to **SQL Editor**
2. Run:

```sql
-- Check if user exists
SELECT * FROM public.users WHERE id = auth.uid();

-- Check if loans table has data
SELECT * FROM public.loans LIMIT 10;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'loans';
```

### Enable Debug Logging
In browser console, run:

```javascript
// Enable detailed logging
localStorage.setItem('debug', '*');
// Reload page
location.reload();
```

---

## ✅ Verification Checklist

Before creating a loan, verify:

- [ ] You are logged in
- [ ] Your user profile exists in database
- [ ] All required fields are filled
- [ ] Principal amount is a valid number
- [ ] Start date is before due date
- [ ] Internet connection is working
- [ ] Supabase is not down

---

## 📞 What to Share With Me

If you still have issues, please provide:

1. **Full error message** from browser console
2. **Screenshot** of the error
3. **Confirmation:**
   - Are you logged in?
   - Can you see the loans list?
   - What fields did you fill?

---

## 🚀 Quick Fix Checklist

Try these in order:

1. [ ] Refresh the page (Ctrl+R)
2. [ ] Log out and log back in
3. [ ] Clear browser cache (Ctrl+Shift+Delete)
4. [ ] Try in a different browser
5. [ ] Check Supabase status
6. [ ] Check browser console for errors
7. [ ] Share error with me

---

**Once you provide the error message, I can fix it immediately!** 🎯

