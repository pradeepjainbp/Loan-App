import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Validate required environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please set it in your .env file or environment configuration.'
  );
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
    'Please set it in your .env file or environment configuration.'
  );
}

// Platform-aware storage: localStorage for web, AsyncStorage for native
const isWeb = typeof window !== 'undefined';

const storage = isWeb
  ? {
      getItem: (key: string) => {
        try {
          return Promise.resolve(localStorage.getItem(key));
        } catch (error) {
          console.error('[Storage] GET error');
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch (error) {
          console.error('[Storage] SET error');
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
          return Promise.resolve();
        } catch (error) {
          console.error('[Storage] REMOVE error');
          return Promise.resolve();
        }
      },
    }
  : AsyncStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security and web compatibility
  },
  global: {
    headers: {
      'X-Client-Info': 'loan-app',
    },
  },
});

// Add session refresh interceptor for web
if (isWeb) {
  // Refresh session every 5 minutes to keep it alive
  setInterval(async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('[Auth] Session refresh failed');
      }
    } catch (err) {
      console.error('[Auth] Session refresh error');
    }
  }, 5 * 60 * 1000); // 5 minutes
}