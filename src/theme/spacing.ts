/**
 * Spacing & Layout System
 * Consistent spacing, border radius, and elevation across platforms
 */

import { Platform, ViewStyle } from 'react-native';

/**
 * Spacing Scale - 4px base unit
 * Follows 8px grid system for visual rhythm
 */
export const spacing = {
  none: 0,
  xxs: 2,      // Tiny gaps
  xs: 4,       // Very small spacing
  sm: 8,       // Small spacing
  md: 12,      // Medium spacing
  lg: 16,      // Default spacing (most common)
  xl: 24,      // Large spacing
  xxl: 32,     // Extra large spacing
  xxxl: 48,    // Section spacing
  huge: 64,    // Hero spacing
  massive: 96, // Page-level spacing
} as const;

/**
 * Border Radius - Modern, friendly roundness
 */
export const borderRadius = {
  none: 0,
  xs: 4,       // Subtle rounding
  sm: 6,       // Small rounding
  md: 8,       // Default rounding (cards)
  lg: 12,      // Large rounding (modals)
  xl: 16,      // Extra large (special cards)
  xxl: 24,     // Very round
  full: 9999,  // Fully round (pills, avatars)
} as const;

/**
 * Elevation - Platform-optimized shadows
 * Provides depth and hierarchy
 */
export const elevation = {
  none: Platform.select({
    ios: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    android: {
      elevation: 0,
    },
    web: {
      boxShadow: 'none',
    },
    default: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
  }),
  
  xs: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
    web: {
      boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
    },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
  }),
  
  sm: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 2px 4px -1px rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
    },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
  }),
  
  md: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
    },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    web: {
      boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.08)',
    },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
  }),
  
  xl: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    android: {
      elevation: 12,
    },
    web: {
      boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
    },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
  }),
  
  xxl: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.18,
      shadowRadius: 40,
    },
    android: {
      elevation: 16,
    },
    web: {
      boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
    },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.18,
      shadowRadius: 40,
    },
  }),
} as const;

/**
 * Container Sizes - Consistent max widths
 */
export const container = {
  xs: 480,    // Mobile
  sm: 640,    // Small tablet
  md: 768,    // Tablet
  lg: 1024,   // Desktop
  xl: 1280,   // Large desktop
  xxl: 1536,  // Extra large desktop
  full: '100%',
} as const;

/**
 * Icon Sizes - Consistent icon dimensions
 */
export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

/**
 * Avatar Sizes - Consistent avatar dimensions
 */
export const avatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  xxl: 96,
} as const;

/**
 * Button Heights - Consistent button sizes
 */
export const buttonHeight = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
} as const;

/**
 * Input Heights - Consistent input field sizes
 */
export const inputHeight = {
  sm: 36,
  md: 44,
  lg: 52,
} as const;

/**
 * Z-Index Scale - Layering system
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
  max: 9999,
} as const;

/**
 * Common Layout Patterns
 */
export const layout = {
  // Card padding
  cardPadding: {
    sm: spacing.md,
    md: spacing.lg,
    lg: spacing.xl,
  },
  
  // Screen padding (horizontal)
  screenPadding: {
    mobile: spacing.lg,
    tablet: spacing.xl,
    desktop: spacing.xxl,
  },
  
  // Section spacing (vertical)
  sectionSpacing: {
    sm: spacing.xl,
    md: spacing.xxl,
    lg: spacing.xxxl,
  },
  
  // List item heights
  listItemHeight: {
    sm: 48,
    md: 56,
    lg: 72,
  },
} as const;

/**
 * Animation Durations
 */
export const duration = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
} as const;

/**
 * Animation Easing
 */
export const easing = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: Platform.select({
    ios: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    android: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    web: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    default: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  }),
} as const;

// Type exports
export type SpacingSize = keyof typeof spacing;
export type BorderRadiusSize = keyof typeof borderRadius;
export type ElevationSize = keyof typeof elevation;
export type IconSize = keyof typeof iconSize;
export type AvatarSize = keyof typeof avatarSize;
