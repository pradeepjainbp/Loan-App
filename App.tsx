import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enGB, registerTranslation } from 'react-native-paper-dates';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { supabase } from './src/config/supabase';
import ErrorBoundary from './src/components/ErrorBoundary';

// Register date picker translations
registerTranslation('en-GB', enGB);

export default function App() {
  const { initialize } = useAuthStore();

useEffect(() => {
  // Handle OAuth callback on web BEFORE initializing
  if (typeof window !== 'undefined') {
    const handleOAuthCallback = async () => {
      console.log('=== OAuth Callback Handler Started ===');
      console.log('Full URL:', window.location.href);
      console.log('Pathname:', window.location.pathname);
      console.log('Search:', window.location.search);
      console.log('Hash:', window.location.hash);

      // Check for error in URL params
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (error) {
        console.error('❌ OAuth Error:', error);
        console.error('❌ Error Description:', errorDescription);
        alert(`OAuth Error: ${error}\n${errorDescription}`);
        // Clear the error from URL
        window.history.replaceState({}, document.title, '/');
        return;
      }

      // Check if we're on the callback route
      if (window.location.pathname === '/auth/callback' || window.location.hash.includes('access_token')) {
        console.log('✅ Processing OAuth callback...');
        console.log('Current URL:', window.location.href);

        try {
          // Supabase will automatically handle the hash fragment with PKCE flow
          // We just need to wait a moment for it to process
          console.log('⏳ Waiting for Supabase to process callback...');
          await new Promise(resolve => setTimeout(resolve, 1000));

          console.log('🔍 Checking session...');
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          console.log('Session data:', session);
          console.log('Session error:', sessionError);

          if (session) {
            console.log('✅ Session established successfully!');
            console.log('User:', session.user.email);
            // Clear the URL and redirect to home
            window.history.replaceState({}, document.title, '/');
          } else if (sessionError) {
            console.error('❌ Session error:', sessionError);
            alert(`Session Error: ${sessionError.message}`);
          } else {
            console.warn('⚠️ No session found after OAuth callback');
            console.log('Hash params:', window.location.hash);
            alert('No session found after OAuth callback. Check console for details.');
          }
        } catch (err) {
          console.error('❌ Error processing OAuth callback:', err);
          alert(`Callback Error: ${err}`);
        }
      } else {
        console.log('ℹ️ Not on callback route, skipping OAuth handling');
      }
    };

    handleOAuthCallback();
  }

  // Initialize auth store
  initialize();
}, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
