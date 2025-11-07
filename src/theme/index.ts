/**
 * Theme System - Centralized Design Tokens
 * Kite-inspired minimalistic design for loan tracking app
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, elevation } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  elevation,
} as const;

// Export individual modules for convenience
export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, elevation } from './spacing';

// Export types
export type Theme = typeof theme;

export default theme;

