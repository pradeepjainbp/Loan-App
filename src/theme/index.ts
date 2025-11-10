/**
 * Theme System - Centralized Design Tokens
 * Modern, minimal design for loan tracking between friends & family
 * Cross-platform consistency: Web, iOS, Android
 */

import { colors, platformColors } from './colors';
import { typography, textColor } from './typography';
import {
  spacing,
  borderRadius,
  elevation,
  container,
  iconSize,
  avatarSize,
  buttonHeight,
  inputHeight,
  zIndex,
  layout,
  duration,
  easing,
} from './spacing';

/**
 * Main Theme Object
 * Import this to access all design tokens
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  elevation,
  container,
  iconSize,
  avatarSize,
  buttonHeight,
  inputHeight,
  zIndex,
  layout,
  duration,
  easing,
  textColor,
  platformColors,
} as const;

// Export individual modules for convenience
export { colors, platformColors } from './colors';
export { typography, textColor } from './typography';
export {
  spacing,
  borderRadius,
  elevation,
  container,
  iconSize,
  avatarSize,
  buttonHeight,
  inputHeight,
  zIndex,
  layout,
  duration,
  easing,
} from './spacing';

// Export types
export type Theme = typeof theme;

export default theme;

/**
 * Usage Examples:
 * 
 * 1. Using colors:
 *    <View style={{ backgroundColor: theme.colors.background.primary }} />
 *    <Text style={{ color: theme.colors.text.primary }}>Hello</Text>
 * 
 * 2. Using typography:
 *    <Text style={theme.typography.heading.h1}>Welcome</Text>
 *    <Text style={[theme.typography.body.medium, theme.textColor.secondary]}>
 *      Description text
 *    </Text>
 * 
 * 3. Using spacing:
 *    <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }} />
 * 
 * 4. Using elevation:
 *    <View style={[styles.card, theme.elevation.md]} />
 * 
 * 5. Using money colors:
 *    <Text style={{ color: theme.colors.money.lent }}>+₹1,000</Text>
 *    <Text style={{ color: theme.colors.money.borrowed }}>-₹500</Text>
 * 
 * 6. Using status colors:
 *    <View style={{
 *      width: 8,
 *      height: 8,
 *      borderRadius: theme.borderRadius.full,
 *      backgroundColor: theme.colors.status.active
 *    }} />
 */
