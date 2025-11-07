# 🔐 Google OAuth Setup Guide

## ✅ What I Fixed

### 1. **Corrected Supabase URL**
- **Old (Wrong)**: `https://iyjklasjkdiyidimgezt.supabase.co`
- **New (Correct)**: `https://jvjklqsjgkdjydimgezt.supabase.co`

### 2. **Updated Google OAuth Implementation**
- Added proper Expo Web Browser integration
- Added redirect URI handling
- Added deep linking scheme configuration

### 3. **Added Deep Linking Support**
- Updated `app.json` with `"scheme": "loan-app"`
- This allows the app to handle OAuth callbacks

---

## 🔧 Supabase Configuration Steps

### **Step 1: Configure Google OAuth in Supabase**

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard/project/jvjklqsjgkdjydimgezt/auth/providers

2. **Enable Google Provider**
   - Click on **"Google"** in the providers list
   - Toggle **"Enable Sign in with Google"** to ON

3. **Add Redirect URLs**
   
   Add these redirect URLs (one per line):
   ```
   http://localhost:8081/auth/callback
   http://localhost:19006/auth/callback
   exp://localhost:8081/--/auth/callback
   loan-app://auth/callback
   ```

4. **Configure Google Cloud Console** (if not done already)
   
   You need to create OAuth credentials in Google Cloud Console:

   a. **Go to Google Cloud Console**
      - Visit: https://console.cloud.google.com/apis/credentials
      - Create a new project or select existing one

   b. **Create OAuth 2.0 Client ID**
      - Click **"Create Credentials"** → **"OAuth client ID"**
      - Application type: **"Web application"**
      - Name: `Loan App - Supabase`

   c. **Add Authorized Redirect URIs**
      ```
      https://jvjklqsjgkdjydimgezt.supabase.co/auth/v1/callback
      ```

   d. **Copy Client ID and Client Secret**
      - You'll get a Client ID and Client Secret
      - Keep these safe!

5. **Add Google Credentials to Supabase**
   
   Back in Supabase Dashboard (Google provider settings):
   - Paste **Client ID** in the "Client ID" field
   - Paste **Client Secret** in the "Client Secret" field
   - Click **"Save"**

---

## 🚀 Testing the Setup

### **Step 1: Restart Your App**

Since we changed the `.env` file and `app.json`, you need to restart:

```bash
# Stop the current dev server (Ctrl+C)

# Clear cache and restart
npx expo start --clear
```

### **Step 2: Test Google Sign-In**

1. Open the app in your browser or Expo Go
2. Click **"Sign in with Google"**
3. You should see the Google login page
4. After signing in, you'll be redirected back to the app

### **Step 3: Check for Errors**

If you see errors, check the console logs:
- Look for the "Redirect URI" log message
- Verify it matches one of the URLs you added in Supabase

---

## 🔍 Troubleshooting

### **Error: "This site can't be reached"**

✅ **FIXED!** This was caused by the wrong Supabase URL in `.env`

### **Error: "redirect_uri_mismatch"**

**Solution:**
1. Check the console log for the actual redirect URI being used
2. Add that exact URI to both:
   - Supabase Dashboard → Authentication → URL Configuration
   - Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs

### **Error: "Invalid OAuth provider"**

**Solution:**
1. Make sure Google provider is enabled in Supabase
2. Verify Client ID and Client Secret are correct
3. Check that you saved the settings

### **Error: "Authentication cancelled"**

This happens when the user closes the browser window. This is normal behavior.

---

## 📋 Redirect URLs Reference

### **For Local Development:**
```
http://localhost:8081/auth/callback
http://localhost:19006/auth/callback
exp://localhost:8081/--/auth/callback
```

### **For Expo Go:**
```
exp://127.0.0.1:8081/--/auth/callback
```

### **For Production (after building):**
```
loan-app://auth/callback
```

### **For Supabase (Google Cloud Console):**
```
https://jvjklqsjgkdjydimgezt.supabase.co/auth/v1/callback
```

---

## 🎯 Next Steps

1. ✅ **Fixed Supabase URL** - Done!
2. ✅ **Updated OAuth implementation** - Done!
3. ✅ **Added deep linking** - Done!
4. ⏳ **Configure Google OAuth in Supabase** - You need to do this
5. ⏳ **Test the authentication** - After configuration

---

## 📝 Important Notes

### **About Phone Authentication**

You mentioned you skipped SMS authentication because it requires payment. That's fine! You can use:
- ✅ **Google OAuth** (Free)
- ✅ **Email/Password** (Free)
- ❌ **Phone/SMS** (Requires payment)

### **About the Database Schema**

Before testing, make sure you've run the database schema:
1. Go to: https://supabase.com/dashboard/project/jvjklqsjgkdjydimgezt/sql/new
2. Copy the contents of `supabase/schema.sql`
3. Paste and run it

This creates the `users` table and other necessary tables.

---

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/jvjklqsjgkdjydimgezt
- **Auth Providers**: https://supabase.com/dashboard/project/jvjklqsjgkdjydimgezt/auth/providers
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **SQL Editor**: https://supabase.com/dashboard/project/jvjklqsjgkdjydimgezt/sql/new

---

## ✅ Summary

**What was wrong:**
1. Wrong Supabase URL in `.env` file
2. Missing Expo Web Browser integration for OAuth
3. Missing deep linking configuration

**What I fixed:**
1. ✅ Corrected the Supabase URL
2. ✅ Added proper OAuth handling with Expo Web Browser
3. ✅ Added deep linking scheme to `app.json`
4. ✅ Added redirect URI configuration

**What you need to do:**
1. Configure Google OAuth in Supabase Dashboard
2. Create OAuth credentials in Google Cloud Console
3. Add redirect URLs to both platforms
4. Restart your app with `npx expo start --clear`
5. Test the Google sign-in

---

Good luck! 🚀

