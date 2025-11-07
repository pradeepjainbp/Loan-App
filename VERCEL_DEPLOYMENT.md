# Deploying Loan App to Vercel

## 🚀 Quick Deployment Steps

### Step 1: Fix the Project Name Error

When creating a new project in Vercel, change the **Private Repository Name** from:
- ❌ `Loan-App` (contains uppercase letters)
- ✅ `loan-app` (all lowercase)

**Vercel project names can only contain:**
- Lowercase letters (a-z)
- Digits (0-9)
- Characters: `.`, `-`, `_`

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `pradeepjainbp/Loan-App`
4. **Change the project name to:** `loan-app` (all lowercase)
5. Vercel will automatically detect the configuration from `vercel.json`
6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? loan-app (lowercase!)
# - Directory? ./
# - Override settings? No
```

---

## ⚙️ Configuration Files Added

### 1. `vercel.json`
Configures Vercel to:
- Build the web version using `expo export:web`
- Serve from the `web-build` directory
- Handle client-side routing (SPA)
- Set proper cache headers

### 2. `package.json` (Updated)
Added build scripts:
- `build:web` - Builds the web version
- `vercel-build` - Used by Vercel during deployment

### 3. `.vercelignore`
Excludes unnecessary files from deployment:
- `node_modules`
- `.expo` cache
- Native platform folders (`android`, `ios`)
- Log files

---

## 🔐 Environment Variables

**IMPORTANT:** You need to add your Supabase credentials to Vercel!

### In Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=https://iyjklasjkdiyidimgezt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Get these values from your `.env` file!**

### Using Vercel CLI:

```bash
vercel env add EXPO_PUBLIC_SUPABASE_URL
# Paste: https://iyjklasjkdiyidimgezt.supabase.co

vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
# Paste your anon key from .env file
```

---

## 🌐 After Deployment

### Your app will be available at:
- Production: `https://loan-app.vercel.app`
- Or custom domain: `https://your-custom-domain.com`

### Update Supabase Redirect URLs

After deployment, update your Supabase authentication settings:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Vercel URL to **Redirect URLs**:
   ```
   https://loan-app.vercel.app/auth/callback
   https://loan-app-*.vercel.app/auth/callback
   ```

---

## 🔄 Automatic Deployments

Once set up, Vercel will automatically deploy:
- ✅ Every push to `master` branch → Production
- ✅ Every pull request → Preview deployment

---

## 🐛 Troubleshooting

### Build Fails

**Error:** "Command failed: npm run build:web"

**Solution:** Make sure all dependencies are in `package.json`, not just `devDependencies`

### Environment Variables Not Working

**Error:** "Invalid API key" or Supabase errors

**Solution:** 
1. Check that environment variables are set in Vercel dashboard
2. Redeploy after adding environment variables
3. Make sure variable names start with `EXPO_PUBLIC_`

### OAuth Not Working

**Error:** "Redirect URI mismatch"

**Solution:**
1. Add Vercel URL to Supabase redirect URLs
2. Include both production and preview URLs:
   - `https://loan-app.vercel.app/auth/callback`
   - `https://loan-app-*.vercel.app/auth/callback`

### App Shows White Screen

**Solution:**
1. Check browser console for errors
2. Verify environment variables are set
3. Check that `web-build` folder was created during build
4. Try rebuilding: `vercel --force`

---

## 📊 Build Output

After successful deployment, you should see:
```
✓ Build Completed
✓ Deployment Ready
✓ Assigned to Production
```

Your app will be live at: `https://loan-app.vercel.app`

---

## 🎯 Next Steps

1. ✅ Deploy to Vercel with lowercase project name
2. ✅ Add environment variables
3. ✅ Update Supabase redirect URLs
4. ✅ Test authentication (Phone OTP and Google OAuth)
5. ✅ Share the link with friends!

---

## 💡 Alternative Hosting Options

If you encounter issues with Vercel, consider:

1. **Netlify** - Similar to Vercel, great for static sites
2. **Firebase Hosting** - Google's hosting solution
3. **GitHub Pages** - Free hosting for static sites
4. **Expo Web Hosting** - Built-in Expo hosting (limited features)

---

## 📝 Notes

- The web version has some limitations compared to native apps
- Some Expo modules may not work on web (we've handled this in the code)
- For best experience, consider building native apps for iOS/Android
- Web version is great for testing and sharing demos!

---

**Good luck with your deployment! 🚀**

