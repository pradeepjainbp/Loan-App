/**
 * Color Palette - Kite-Inspired Design
 * Soft, friendly colors for a loan app between friends and family
 */

export const colors = {
  // Primary Colors - Soft, friendly blue (instead of harsh purple)
  primary: '#4A90E2',
  primaryLight: '#E3F2FD',
  primaryDark: '#2E5C8A',
  
  // Background Colors
  background: '#FAFBFC',        // Off-white (not pure white)
  surface: '#FFFFFF',           // Pure white for cards
  surfaceVariant: '#F5F7FA',    // Light gray for subtle sections
  
  // Text Colors - Blue-gray tones (not harsh black)
  textPrimary: '#2C3E50',       // Dark blue-gray
  textSecondary: '#7F8C9A',     // Medium gray
  textTertiary: '#B0BEC5',      // Light gray
  textDisabled: '#CFD8DC',      // Very light gray
  
  // Success/Positive - Gentle green (money lent out)
  success: '#52C41A',
  successLight: '#F6FFED',
  successBorder: '#B7EB8F',
  
  // Warning/Attention - Warm orange (not alarming)
  warning: '#FAAD14',
  warningLight: '#FFFBE6',
  warningBorder: '#FFE58F',
  
  // Error/Urgent - Soft red (not aggressive)
  error: '#FF4D4F',
  errorLight: '#FFF1F0',
  errorBorder: '#FFCCC7',
  
  // Info - Calm blue
  info: '#1890FF',
  infoLight: '#E6F7FF',
  infoBorder: '#91D5FF',
  
  // Neutral - For closed/inactive
  neutral: '#8C8C8C',
  neutralLight: '#FAFAFA',
  neutralBorder: '#D9D9D9',
  
  // Money Colors (Context-Aware)
  lent: '#52C41A',              // Gentle green (you lent = positive)
  borrowed: '#4A90E2',          // Soft blue (you borrowed = neutral, not negative!)
  netPositive: '#52C41A',       // Green when net positive
  netNegative: '#FF4D4F',       // Soft red when net negative
  
  // Status Colors
  active: '#52C41A',            // Green for active loans
  overdue: '#FF4D4F',           // Soft red for overdue
  dueSoon: '#FAAD14',           // Warm orange for due soon
  closed: '#8C8C8C',            // Gray for closed
  
  // Borders & Dividers
  border: '#E8E8E8',
  divider: '#F0F0F0',
  
  // Shadows (for elevation)
  shadow: '#000000',
} as const;

// Legacy color mappings (for gradual migration)
export const legacyColors = {
  // Map old colors to new ones
  purple: colors.primary,
  green: colors.success,
  red: colors.error,
  orange: colors.warning,
  gray: colors.neutral,
};

export type ColorName = keyof typeof colors;

