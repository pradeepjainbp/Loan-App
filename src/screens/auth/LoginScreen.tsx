import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const [mode, setMode] = useState<'phone' | 'google'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  
  const { signInWithGoogle, signInWithPhone, verifyOTP, loading } = useAuthStore();

  const handleSendOTP = async () => {
    try {
      setError('');
      if (!phone || phone.length < 10) {
        setError('Please enter a valid phone number');
        return;
      }
      
      await signInWithPhone(phone);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setError('');
      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
      }
      
      await verifyOTP(phone, otp);
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Title style={styles.title}>Loan App</Title>
          <Paragraph style={styles.subtitle}>
            Track and manage your personal loans
          </Paragraph>

          <Card style={styles.card}>
            <Card.Content>
              {mode === 'phone' ? (
                <>
                  <Text style={styles.label}>Sign in with Phone Number</Text>
                  
                  {!otpSent ? (
                    <>
                      <TextInput
                        label="Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        mode="outlined"
                        style={styles.input}
                        placeholder="+1234567890"
                        disabled={loading}
                      />
                      
                      <Button
                        mode="contained"
                        onPress={handleSendOTP}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                      >
                        Send OTP
                      </Button>
                    </>
                  ) : (
                    <>
                      <Text style={styles.otpInfo}>
                        OTP sent to {phone}
                      </Text>
                      
                      <TextInput
                        label="Enter OTP"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        mode="outlined"
                        style={styles.input}
                        placeholder="123456"
                        maxLength={6}
                        disabled={loading}
                      />
                      
                      <Button
                        mode="contained"
                        onPress={handleVerifyOTP}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                      >
                        Verify OTP
                      </Button>
                      
                      <Button
                        mode="text"
                        onPress={() => setOtpSent(false)}
                        disabled={loading}
                        style={styles.backButton}
                      >
                        Change Phone Number
                      </Button>
                    </>
                  )}
                </>
              ) : null}

              {error ? (
                <Text style={styles.error}>{error}</Text>
              ) : null}

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                mode="outlined"
                onPress={handleGoogleSignIn}
                loading={loading && mode === 'google'}
                disabled={loading}
                style={styles.button}
                icon="google"
              >
                Sign in with Google
              </Button>
            </Card.Content>
          </Card>

          <Text style={styles.footer}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#6200ee',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  backButton: {
    marginTop: 8,
  },
  otpInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  footer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

