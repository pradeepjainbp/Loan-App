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
    const initializeApp = async () => {
      // Handle OAuth callback on web BEFORE initializing
      if (typeof window !== 'undefined') {
        const handleOAuthCallback = async () => {
          // Check for error in URL params
          const urlParams = new URLSearchParams(window.location.search);
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');

          if (error) {
            console.error('[OAuth] Authentication failed');
            alert(`OAuth Error: ${error}\n${errorDescription}`);
            // Clear the error from URL
            window.history.replaceState({}, document.title, '/');
            return;
          }

          // Check if we're on the callback route
          if (window.location.pathname === '/auth/callback' || window.location.hash.includes('access_token')) {
            try {
              // Supabase will automatically handle the hash fragment with PKCE flow
              // We just need to wait a moment for it to process
              await new Promise(resolve => setTimeout(resolve, 1000));

              const { data: { session }, error: sessionError } = await supabase.auth.getSession();

              if (session) {
                // Clear the URL and redirect to home
                window.history.replaceState({}, document.title, '/');
              } else if (sessionError) {
                console.error('[Auth] Session error');
                alert(`Session Error: ${sessionError.message}`);
              } else {
                console.error('[Auth] No session after callback');
                alert('No session found after OAuth callback.');
              }
            } catch (err) {
              console.error('[Auth] Callback processing failed');
              alert(`Callback Error: ${err}`);
            }
          }
        };

        await handleOAuthCallback();
      }

      // Attempt to recover existing session before initializing
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Session recovery failed');
        }
      } catch (err) {
        console.error('[Auth] Session recovery error');
      }

      // Initialize auth store
      initialize();
    };

    initializeApp();
  }, [initialize]);

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
