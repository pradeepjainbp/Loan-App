/**
 * Color System - Modern & Friendly
 * Designed for cross-platform consistency (Web, iOS, Android)
 * Optimized for loan tracking between friends and family
 */

export const colors = {
  // Primary - Trustworthy Blue (replaces harsh purple)
  primary: '#2563EB',           // Modern blue - trust, reliability
  primaryLight: '#DBEAFE',      // Light blue background
  primaryDark: '#1E40AF',       // Darker blue for pressed states
  primaryHover: '#3B82F6',      // Hover state
  
  // Secondary - Warm Accent
  secondary: '#8B5CF6',         // Soft purple for variety
  secondaryLight: '#EDE9FE',
  secondaryDark: '#6D28D9',
  
  // Background Hierarchy
  background: {
    primary: '#FFFFFF',         // Main background (cards, surfaces)
    secondary: '#F8FAFC',       // Page background (slightly off-white)
    tertiary: '#F1F5F9',        // Subtle sections/dividers
    elevated: '#FFFFFF',        // Elevated cards (same as primary for clean look)
  },
  
  // Text Hierarchy - Blue-gray scale for warmth
  text: {
    primary: '#0F172A',         // Almost black with blue tone
    secondary: '#64748B',       // Medium gray for descriptions
    tertiary: '#94A3B8',        // Light gray for labels
    disabled: '#CBD5E1',        // Very light for disabled
    inverse: '#FFFFFF',         // White text on dark backgrounds
  },
  
  // Semantic Colors - Context-aware and friendly
  semantic: {
    // Success/Positive - You lent money (good for you)
    success: {
      main: '#10B981',          // Fresh green
      light: '#D1FAE5',
      dark: '#059669',
      border: '#6EE7B7',
    },
    
    // Info - Neutral transactions
    info: {
      main: '#0EA5E9',          // Sky blue
      light: '#E0F2FE',
      dark: '#0284C7',
      border: '#7DD3FC',
    },
    
    // Warning - Attention needed (due soon)
    warning: {
      main: '#F59E0B',          // Warm amber
      light: '#FEF3C7',
      dark: '#D97706',
      border: '#FCD34D',
    },
    
    // Error - Urgent action (overdue)
    error: {
      main: '#EF4444',          // Soft red (not aggressive)
      light: '#FEE2E2',
      dark: '#DC2626',
      border: '#FCA5A5',
    },
    
    // Neutral - Inactive/closed
    neutral: {
      main: '#6B7280',
      light: '#F9FAFB',
      dark: '#374151',
      border: '#E5E7EB',
    },
  },
  
  // Money Context Colors (Key for loan tracking)
  money: {
    lent: '#10B981',            // Green - you lent (positive for you)
    borrowed: '#2563EB',        // Blue - you borrowed (neutral, not negative!)
    received: '#10B981',        // Green - payment received
    paid: '#0EA5E9',           // Blue - payment made
    netPositive: '#10B981',     // Net lender
    netNegative: '#EF4444',     // Net borrower
  },
  
  // Status Colors (Loan states)
  status: {
    active: '#10B981',          // Green dot
    pending: '#F59E0B',         // Amber dot
    overdue: '#EF4444',         // Red dot
    dueSoon: '#F59E0B',         // Amber dot
    settled: '#6B7280',         // Gray dot
    closed: '#6B7280',          // Gray dot
  },
  
  // UI Elements
  ui: {
    border: '#E2E8F0',          // Subtle borders
    divider: '#F1F5F9',         // Lighter dividers
    overlay: 'rgba(15, 23, 42, 0.5)',  // Dark overlay for modals
    skeleton: '#E2E8F0',        // Loading skeletons
    focus: '#2563EB',           // Focus rings
  },
  
  // Interactive States (for buttons, links)
  interactive: {
    hover: 'rgba(37, 99, 235, 0.08)',    // Subtle blue hover
    pressed: 'rgba(37, 99, 235, 0.12)',  // Slightly darker pressed
    disabled: '#F1F5F9',                  // Disabled background
    selected: '#DBEAFE',                  // Selected state
  },
  
  // Chart Colors (for analytics/graphs)
  chart: {
    primary: '#2563EB',
    secondary: '#8B5CF6',
    tertiary: '#10B981',
    quaternary: '#F59E0B',
    quinary: '#EF4444',
    senary: '#06B6D4',
  },
  
  // Special Colors
  special: {
    highlight: '#FEF3C7',       // Yellow highlight
    badge: '#EF4444',           // Red badge (notifications)
    link: '#2563EB',            // Link color
  },
} as const;

// Platform-specific adjustments (optional usage)
export const platformColors = {
  // iOS uses more shadows, Android uses more elevation
  ios: {
    shadowColor: 'rgba(15, 23, 42, 0.12)',
  },
  android: {
    shadowColor: 'rgba(15, 23, 42, 0.08)',
  },
  web: {
    shadowColor: 'rgba(15, 23, 42, 0.1)',
  },
};

export type ColorPath = keyof typeof colors;
