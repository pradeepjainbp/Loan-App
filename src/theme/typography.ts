/**
 * Typography System - Modern & Readable
 * Optimized for cross-platform consistency
 * Uses system fonts for best performance and native feel
 */

import { TextStyle, Platform } from 'react-native';
import { colors } from './colors';

// Platform-specific font families
const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
};

export const typography = {
  // Display - For hero sections, large numbers
  display: {
    large: {
      fontFamily: fontFamily.bold,
      fontSize: 40,
      fontWeight: '700' as TextStyle['fontWeight'],
      lineHeight: 48,
      letterSpacing: -1,
      color: colors.text.primary,
    },
    medium: {
      fontFamily: fontFamily.bold,
      fontSize: 36,
      fontWeight: '700' as TextStyle['fontWeight'],
      lineHeight: 44,
      letterSpacing: -0.8,
      color: colors.text.primary,
    },
    small: {
      fontFamily: fontFamily.bold,
      fontSize: 32,
      fontWeight: '700' as TextStyle['fontWeight'],
      lineHeight: 40,
      letterSpacing: -0.6,
      color: colors.text.primary,
    },
  },
  
  // Headings - For section titles
  heading: {
    h1: {
      fontFamily: fontFamily.bold,
      fontSize: 28,
      fontWeight: '700' as TextStyle['fontWeight'],
      lineHeight: 36,
      letterSpacing: -0.5,
      color: colors.text.primary,
    },
    h2: {
      fontFamily: fontFamily.semibold,
      fontSize: 24,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 32,
      letterSpacing: -0.4,
      color: colors.text.primary,
    },
    h3: {
      fontFamily: fontFamily.semibold,
      fontSize: 20,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 28,
      letterSpacing: -0.2,
      color: colors.text.primary,
    },
    h4: {
      fontFamily: fontFamily.semibold,
      fontSize: 18,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 26,
      letterSpacing: 0,
      color: colors.text.primary,
    },
    h5: {
      fontFamily: fontFamily.semibold,
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 24,
      letterSpacing: 0,
      color: colors.text.primary,
    },
  },
  
  // Body Text - For content
  body: {
    large: {
      fontFamily: fontFamily.regular,
      fontSize: 18,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 28,
      letterSpacing: 0,
      color: colors.text.primary,
    },
    medium: {
      fontFamily: fontFamily.regular,
      fontSize: 16,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 24,
      letterSpacing: 0,
      color: colors.text.primary,
    },
    small: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 20,
      letterSpacing: 0,
      color: colors.text.secondary,
    },
  },
  
  // Labels - For form labels, tags
  label: {
    large: {
      fontFamily: fontFamily.medium,
      fontSize: 14,
      fontWeight: '500' as TextStyle['fontWeight'],
      lineHeight: 20,
      letterSpacing: 0.1,
      color: colors.text.secondary,
    },
    medium: {
      fontFamily: fontFamily.medium,
      fontSize: 13,
      fontWeight: '500' as TextStyle['fontWeight'],
      lineHeight: 18,
      letterSpacing: 0.1,
      color: colors.text.secondary,
    },
    small: {
      fontFamily: fontFamily.medium,
      fontSize: 12,
      fontWeight: '500' as TextStyle['fontWeight'],
      lineHeight: 16,
      letterSpacing: 0.2,
      color: colors.text.tertiary,
    },
  },
  
  // Caption - For hints, meta info
  caption: {
    regular: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 16,
      letterSpacing: 0.2,
      color: colors.text.tertiary,
    },
    medium: {
      fontFamily: fontFamily.medium,
      fontSize: 12,
      fontWeight: '500' as TextStyle['fontWeight'],
      lineHeight: 16,
      letterSpacing: 0.2,
      color: colors.text.tertiary,
    },
  },
  
  // Money Amounts - Special formatting for currency
  amount: {
    hero: {
      fontFamily: fontFamily.bold,
      fontSize: 48,
      fontWeight: '700' as TextStyle['fontWeight'],
      lineHeight: 56,
      letterSpacing: -1.5,
      color: colors.text.primary,
    },
    large: {
      fontFamily: fontFamily.bold,
      fontSize: 36,
      fontWeight: '700' as TextStyle['fontWeight'],
      lineHeight: 44,
      letterSpacing: -1,
      color: colors.text.primary,
    },
    medium: {
      fontFamily: fontFamily.semibold,
      fontSize: 24,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 32,
      letterSpacing: -0.5,
      color: colors.text.primary,
    },
    small: {
      fontFamily: fontFamily.semibold,
      fontSize: 18,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 24,
      letterSpacing: -0.2,
      color: colors.text.primary,
    },
    tiny: {
      fontFamily: fontFamily.medium,
      fontSize: 14,
      fontWeight: '500' as TextStyle['fontWeight'],
      lineHeight: 20,
      letterSpacing: 0,
      color: colors.text.primary,
    },
  },
  
  // Buttons
  button: {
    large: {
      fontFamily: fontFamily.semibold,
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 24,
      letterSpacing: 0.2,
    },
    medium: {
      fontFamily: fontFamily.semibold,
      fontSize: 14,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 20,
      letterSpacing: 0.2,
    },
    small: {
      fontFamily: fontFamily.medium,
      fontSize: 13,
      fontWeight: '500' as TextStyle['fontWeight'],
      lineHeight: 18,
      letterSpacing: 0.2,
    },
  },
  
  // Input Fields
  input: {
    large: {
      fontFamily: fontFamily.regular,
      fontSize: 16,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 24,
      letterSpacing: 0,
      color: colors.text.primary,
    },
    medium: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 20,
      letterSpacing: 0,
      color: colors.text.primary,
    },
  },
  
  // Overline - For tags, categories
  overline: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 16,
    letterSpacing: 1,
    color: colors.text.secondary,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  
  // Monospace - For IDs, codes
  mono: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      default: 'monospace',
    }),
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
    letterSpacing: 0,
    color: colors.text.secondary,
  },
} as const;

// Helper function to apply text color variations
export const textColor = {
  primary: { color: colors.text.primary },
  secondary: { color: colors.text.secondary },
  tertiary: { color: colors.text.tertiary },
  disabled: { color: colors.text.disabled },
  inverse: { color: colors.text.inverse },
  success: { color: colors.semantic.success.main },
  error: { color: colors.semantic.error.main },
  warning: { color: colors.semantic.warning.main },
  info: { color: colors.semantic.info.main },
  lent: { color: colors.money.lent },
  borrowed: { color: colors.money.borrowed },
} as const;

export type TypographyVariant = keyof typeof typography;
