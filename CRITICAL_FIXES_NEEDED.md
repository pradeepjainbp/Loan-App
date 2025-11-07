# Critical Fixes Needed - Priority Order

## 🔴 CRITICAL - Must Fix Immediately

### 1. User Profile Creation on First Login ⚠️ **BLOCKING ISSUE**
**Problem:** When users sign in with Google for the first time, no user record is created in the `users` table, causing `appUser` to be null.

**Impact:** 
- App crashes or shows errors
- Cannot create loans (lender name is empty)
- Settings screen shows incomplete data

**Fix Location:** `src/store/authStore.ts`

**Solution:**
```typescript
// In fetchAppUser function, add user creation if not exists
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single();

if (error && error.code === 'PGRST116') {
  // User doesn't exist, create one
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([{
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      settings: {
        currency: 'USD',
        date_format: 'MM/DD/YYYY',
        default_interest_type: 'none',
        default_compounding_frequency: 'monthly',
        default_reminder_days: 7,
        notifications_enabled: true,
        email_notifications_enabled: true,
        theme: 'system'
      }
    }])
    .select()
    .single();
    
  if (createError) throw createError;
  set({ appUser: newUser });
} else if (error) {
  throw error;
} else {
  set({ appUser: data });
}
```

---

### 2. Input Sanitization (XSS Prevention) 🛡️
**Problem:** User inputs are not sanitized, allowing potential XSS attacks.

**Impact:** Security vulnerability

**Fix Required:**
1. Install DOMPurify: `npm install dompurify @types/dompurify`
2. Create sanitization utility
3. Sanitize all user inputs before storage

**Solution:**
```typescript
// src/utils/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html);
}
```

---

### 3. Row Level Security (RLS) Verification ⚠️
**Problem:** Cannot verify if RLS policies are correctly implemented in Supabase.

**Impact:** Users might see each other's data

**Action Required:**
1. Go to Supabase Dashboard → Database → Policies
2. Verify RLS is enabled on all tables
3. Verify policies exist for:
   - `loans`: Users can only see their own loans
   - `repayments`: Users can only see repayments for their loans
   - `users`: Users can only see/update their own profile

**Required Policies:**

```sql
-- Enable RLS on loans table
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own loans
CREATE POLICY "Users can view own loans" ON loans
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own loans
CREATE POLICY "Users can insert own loans" ON loans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own loans
CREATE POLICY "Users can update own loans" ON loans
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own loans
CREATE POLICY "Users can delete own loans" ON loans
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for repayments table
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own repayments" ON repayments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM loans 
      WHERE loans.id = repayments.loan_id 
      AND loans.user_id = auth.uid()
    )
  );

-- Similar for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

---

### 4. Remove Sensitive Data from Console Logs 🔒
**Problem:** Debug logs contain sensitive user data.

**Impact:** Information leakage in production

**Fix Required:**
1. Create environment-aware logging utility
2. Replace all `console.log` with conditional logging
3. Disable in production

**Solution:**
```typescript
// src/utils/logger.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) console.log(...args);
  },
  error: (...args: any[]) => {
    if (isDevelopment) console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDevelopment) console.warn(...args);
  },
  info: (...args: any[]) => {
    if (isDevelopment) console.info(...args);
  }
};
```

---

### 5. Add Error Boundaries 🛡️
**Problem:** App crashes completely on errors.

**Impact:** Poor user experience

**Solution:**
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <Button
            title="Reload App"
            onPress={() => window.location.reload()}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 🟡 HIGH PRIORITY - Fix Soon

### 6. Edit Loan Functionality
**Status:** Missing completely  
**Impact:** Cannot correct mistakes  
**Effort:** 4-6 hours

### 7. Delete Loan Functionality
**Status:** Missing completely  
**Impact:** Cannot remove test data  
**Effort:** 2-3 hours

### 8. Date Pickers
**Status:** Manual text input only  
**Impact:** Poor UX, error-prone  
**Effort:** 3-4 hours  
**Recommendation:** Use `react-native-paper-dates`

### 9. Edit/Delete Repayment
**Status:** Missing completely  
**Impact:** Cannot correct payment mistakes  
**Effort:** 4-5 hours

### 10. Maximum Amount Warnings
**Status:** Validation exists but no UI warning  
**Impact:** Users might enter wrong amounts  
**Effort:** 1-2 hours

---

## 🟢 MEDIUM PRIORITY - Nice to Have

### 11. Export Functionality
**Status:** Button exists but shows "coming soon"  
**Effort:** 6-8 hours

### 12. Payment Reminders
**Status:** Database schema exists, no UI  
**Effort:** 8-10 hours

### 13. Charts/Visualizations
**Status:** Not implemented  
**Effort:** 10-12 hours

### 14. Offline Support
**Status:** Not implemented  
**Effort:** 15-20 hours

### 15. Unit Tests
**Status:** No tests exist  
**Effort:** 20-30 hours

---

## Implementation Order

### Week 1 (Critical Fixes):
1. ✅ User profile creation (Day 1)
2. ✅ Input sanitization (Day 1-2)
3. ✅ RLS verification (Day 2)
4. ✅ Remove sensitive logs (Day 2)
5. ✅ Error boundaries (Day 3)
6. ✅ Edit loan functionality (Day 3-4)
7. ✅ Delete loan functionality (Day 4)

### Week 2 (High Priority):
8. Date pickers (Day 1-2)
9. Edit/Delete repayment (Day 2-3)
10. Maximum amount warnings (Day 3)
11. Standardize error handling (Day 4-5)

### Week 3 (Medium Priority):
12. Export functionality (Day 1-2)
13. Payment reminders (Day 3-4)
14. Charts/visualizations (Day 5)

### Week 4 (Testing & Polish):
15. Unit tests
16. Integration tests
17. Security audit
18. Performance optimization

---

## Estimated Total Effort

- **Critical Fixes:** 20-25 hours
- **High Priority:** 20-25 hours
- **Medium Priority:** 40-50 hours
- **Testing & Polish:** 30-40 hours

**Total:** 110-140 hours (3-4 weeks for 1 developer)

---

## Next Steps

1. **Immediate:** Implement user profile creation fix
2. **Today:** Add input sanitization
3. **This Week:** Verify RLS policies in Supabase
4. **This Week:** Implement edit/delete functionality
5. **Next Week:** Add date pickers and improve UX

