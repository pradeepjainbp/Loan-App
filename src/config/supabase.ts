import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace these with your actual Supabase project credentials
// You can get these from your Supabase project settings at https://app.supabase.com
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Platform-aware storage: localStorage for web, AsyncStorage for native
const isWeb = typeof window !== 'undefined';

const storage = isWeb
  ? {
      getItem: (key: string) => {
        try {
          const value = localStorage.getItem(key);
          console.log(`[Storage] GET ${key}:`, value ? 'found' : 'not found');
          return Promise.resolve(value);
        } catch (error) {
          console.error(`[Storage] GET ${key} error:`, error);
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
          console.log(`[Storage] SET ${key}: success`);
          return Promise.resolve();
        } catch (error) {
          console.error(`[Storage] SET ${key} error:`, error);
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
          console.log(`[Storage] REMOVE ${key}: success`);
          return Promise.resolve();
        } catch (error) {
          console.error(`[Storage] REMOVE ${key} error:`, error);
          return Promise.resolve();
        }
      },
    }
  : AsyncStorage;

console.log(`[Supabase] Initializing on ${isWeb ? 'WEB' : 'NATIVE'} platform`);
console.log(`[Supabase] URL: ${SUPABASE_URL}`);
console.log(`[Supabase] Using ${isWeb ? 'localStorage' : 'AsyncStorage'}`);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security and web compatibility
  },
});