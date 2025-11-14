import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, borderRadius, elevation } from '../../theme';

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
      setMode('google');
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setMode('phone');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🤝</Text>
            </View>
            <Text style={styles.appName}>LoanTracker</Text>
            <Text style={styles.tagline}>
              Track loans between friends & family
            </Text>
          </View>

          {/* Login Card */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              {mode === 'phone' ? (
                <>
                  <Text style={styles.cardTitle}>Welcome back</Text>
                  <Text style={styles.cardSubtitle}>
                    Sign in to manage your loans
                  </Text>
                  
                  {!otpSent ? (
                    <>
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad"
                          mode="outlined"
                          style={styles.input}
                          placeholder="+1234567890"
                          disabled={loading}
                          outlineColor={colors.ui.border}
                          activeOutlineColor={colors.primary}
                          placeholderTextColor={colors.text.tertiary}
                          outlineStyle={{ borderRadius: borderRadius.md }}
                        />
                      </View>
                      
                      <Button
                        mode="contained"
                        onPress={handleSendOTP}
                        loading={loading}
                        disabled={loading}
                        style={styles.primaryButton}
                        buttonColor={colors.primary}
                        labelStyle={styles.buttonLabel}
                      >
                        Send OTP
                      </Button>
                    </>
                  ) : (
                    <>
                      <View style={styles.otpInfoContainer}>
                        <Text style={styles.otpIcon}>📱</Text>
                        <Text style={styles.otpInfo}>
                          We've sent a code to
                        </Text>
                        <Text style={styles.otpPhone}>{phone}</Text>
                      </View>
                      
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Enter 6-digit code</Text>
                        <TextInput
                          value={otp}
                          onChangeText={setOtp}
                          keyboardType="number-pad"
                          mode="outlined"
                          style={styles.input}
                          placeholder="000000"
                          maxLength={6}
                          disabled={loading}
                          outlineColor={colors.ui.border}
                          activeOutlineColor={colors.primary}
                          placeholderTextColor={colors.text.tertiary}
                          outlineStyle={{ borderRadius: borderRadius.md }}
                        />
                      </View>
                      
                      <Button
                        mode="contained"
                        onPress={handleVerifyOTP}
                        loading={loading}
                        disabled={loading}
                        style={styles.primaryButton}
                        buttonColor={colors.primary}
                        labelStyle={styles.buttonLabel}
                      >
                        Verify & Continue
                      </Button>
                      
                      <Button
                        mode="text"
                        onPress={() => setOtpSent(false)}
                        disabled={loading}
                        style={styles.textButton}
                        labelStyle={styles.textButtonLabel}
                        textColor={colors.text.secondary}
                      >
                        Change phone number
                      </Button>
                    </>
                  )}
                </>
              ) : null}

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                mode="outlined"
                onPress={handleGoogleSignIn}
                loading={loading && mode === 'google'}
                disabled={loading}
                style={styles.googleButton}
                labelStyle={styles.googleButtonLabel}
                icon="google"
                textColor={colors.text.primary}
              >
                Continue with Google
              </Button>
            </Card.Content>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms</Text>
              {' & '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  content: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...elevation.sm,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    ...typography.heading.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  
  // Card
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...elevation.md,
  },
  cardContent: {
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardSubtitle: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  
  // Inputs
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.primary,
    fontSize: 16,
  },
  
  // OTP Info
  otpInfoContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  otpIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  otpInfo: {
    ...typography.body.small,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  otpPhone: {
    ...typography.body.medium,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  
  // Buttons
  primaryButton: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    height: 48,
    justifyContent: 'center',
  },
  buttonLabel: {
    ...typography.button.medium,
    fontSize: 16,
  },
  textButton: {
    marginTop: spacing.xs,
  },
  textButtonLabel: {
    ...typography.button.small,
  },
  googleButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.ui.border,
    height: 48,
    justifyContent: 'center',
  },
  googleButtonLabel: {
    ...typography.button.medium,
    fontSize: 16,
  },
  
  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.error.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.semantic.error.main,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  errorText: {
    ...typography.body.small,
    color: colors.semantic.error.dark,
    flex: 1,
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.ui.divider,
  },
  dividerText: {
    ...typography.label.small,
    color: colors.text.tertiary,
    marginHorizontal: spacing.lg,
    textTransform: 'uppercase',
  },
  
  // Footer
  footer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  footerText: {
    ...typography.caption.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '500',
  },
});