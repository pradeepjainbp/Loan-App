/**
 * Typography System
 * Clear hierarchy with readable fonts
 */

import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography = {
  // Headers
  h1: {
    fontSize: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    lineHeight: 26,
  },
  
  // Body Text
  body1: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: colors.textSecondary,
    lineHeight: 20,
  },
  
  // Small Text
  caption: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: colors.textTertiary,
    lineHeight: 16,
  },
  
  // Numbers (Amounts)
  amountLarge: {
    fontSize: 32,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  amountSmall: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    lineHeight: 24,
  },
  
  // Buttons
  button: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  
  // Labels
  label: {
    fontSize: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: colors.textSecondary,
    lineHeight: 20,
  },
  
  // Input Text
  input: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    lineHeight: 24,
  },
} as const;

export type TypographyVariant = keyof typeof typography;

