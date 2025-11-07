import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { User as AppUser } from '../types';

// Conditionally import expo modules only for native platforms
let WebBrowser: any = null;
let makeRedirectUri: any = null;

try {
  if (typeof window === 'undefined' || (window as any).navigator?.product === 'ReactNative') {
    // Only import for native platforms
    WebBrowser = require('expo-web-browser');
    const authSession = require('expo-auth-session');
    makeRedirectUri = authSession.makeRedirectUri;

    // Required for Expo web browser to work properly on native
    if (WebBrowser?.maybeCompleteAuthSession) {
      WebBrowser.maybeCompleteAuthSession();
    }
  }
} catch (error) {
  console.log('Expo native modules not available (web platform)');
}

interface AuthState {
  user: User | null;
  appUser: AppUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  authListener: { data: { subscription: { unsubscribe: () => void } } } | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  fetchAppUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  appUser: null,
  session: null,
  loading: false,
  initialized: false,
  authListener: null,

  initialize: async () => {
    try {
      set({ loading: true });

      // Clean up existing listener if any
      const { authListener } = get();
      if (authListener) {
        authListener.data.subscription.unsubscribe();
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        set({ user: session.user, session });
        await get().fetchAppUser();
      }

      // Listen for auth changes
      const listener = supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log('Auth state change:', _event, session);
        set({ user: session?.user ?? null, session });
        if (session?.user) {
          await get().fetchAppUser();
        } else {
          set({ appUser: null });
        }
      });

      set({ authListener: listener, initialized: true });
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchAppUser: async () => {
    try {
      const { user } = get();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // If user doesn't exist, create a new user profile
      if (error && error.code === 'PGRST116') {
        console.log('User profile not found, creating new profile...');

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            phone: user.phone,
            full_name: user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      user.email?.split('@')[0] ||
                      'User',
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

        if (createError) {
          console.error('Error creating user profile:', createError);
          throw createError;
        }

        console.log('✅ User profile created successfully:', newUser);
        set({ appUser: newUser });
      } else if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      } else {
        set({ appUser: data });
      }
    } catch (error) {
      console.error('Error in fetchAppUser:', error);
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ loading: true });

      // Detect if we're on web platform
      const isWeb = typeof window !== 'undefined' && window.location;

      let redirectTo: string;

      if (isWeb) {
        // For web, use the current origin + /auth/callback
        const origin = window.location.origin;
        redirectTo = `${origin}/auth/callback`;
      } else {
        // For mobile, use deep linking
        if (!makeRedirectUri) {
          throw new Error('expo-auth-session not available');
        }
        redirectTo = makeRedirectUri({
          scheme: 'loan-app',
          path: 'auth/callback',
        });
      }

      console.log('=== Google Sign-In Debug ===');
      console.log('Redirect URI:', redirectTo);
      console.log('Platform:', isWeb ? 'web' : 'mobile');
      console.log('Current URL:', isWeb ? window.location.href : 'N/A');
      console.log('Window origin:', isWeb ? window.location.origin : 'N/A');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false, // Let Supabase handle the redirect for web
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ OAuth initiation error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ OAuth URL generated:', data?.url);
      console.log('OAuth provider:', data?.provider);

      if (isWeb && data?.url) {
        console.log('🌐 Redirecting to Google OAuth...');
        console.log('Full OAuth URL:', data.url);
      }

      // For mobile, we need to handle it manually
      if (!isWeb && data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        console.log('WebBrowser result:', result);

        if (result.type === 'success') {
          const url = result.url;
          // Extract the session from the URL
          const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) {
              console.error('Session error:', sessionError);
              throw sessionError;
            }
          } else {
            console.error('No tokens found in callback URL');
            throw new Error('Authentication failed: No tokens received');
          }
        } else if (result.type === 'cancel') {
          throw new Error('Authentication cancelled');
        }
      }
      // For web, the browser will redirect automatically
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        details: error.details,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signInWithPhone: async (phone: string) => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with phone:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  verifyOTP: async (phone: string, token: string) => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, appUser: null, session: null });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

