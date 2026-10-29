// constants/theme.ts - High-Speed Retail Branding System
export interface ThemeColors {
  // Brand Accents
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  success: string;
  error: string;
  accent: string;

  // Surfaces & Layout
  background: string;
  surface: string;
  surfaceLight: string;
  border: string;
  borderLight: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Authentic Thermal Paper Realism (Always Cream in both modes)
  paperBackground: string;
  paperBorder: string;
  paperText: string;
  paperMuted: string;
}

export const DarkTheme: ThemeColors = {
  primary: '#F97316',        // Safety Orange (New Bill, Main CTAs, Active Tabs)
  primaryLight: 'rgba(249, 115, 22, 0.15)',
  secondary: '#6366F1',      // Indigo Purple (Secondary actions, badges)
  secondaryLight: 'rgba(99, 102, 241, 0.15)',
  success: '#22C55E',        // Emerald Green (Payment Clear, Printer Connected, Print CTA)
  error: '#EF4444',          // Warning Red (Disconnect, Delete Item)
  accent: '#00D2FF',         // Cyan / Monospace Tag Accent

  background: '#09090B',     // Jet Pitch Black Canvas
  surface: '#18181B',        // Dark Zinc Gray Cards
  surfaceLight: '#27272A',   // Lighter Zinc for sub-elements & inactive buttons
  border: '#27272A',         // Subtle Borders
  borderLight: '#3F3F46',    // Visible Borders

  textPrimary: '#FAFAFA',    // Crisp White Headings & Values
  textSecondary: '#A1A1AA',  // Slate Gray Labels & Timestamps
  textMuted: '#71717A',      // Muted Gray Captions

  paperBackground: '#FFFDF0', // Authentic Cream Thermal POS Paper
  paperBorder: '#D4CEB0',
  paperText: '#111111',
  paperMuted: '#555555',
};

export const LightTheme: ThemeColors = {
  primary: '#F97316',        // Safety Orange
  primaryLight: 'rgba(249, 115, 22, 0.12)',
  secondary: '#6366F1',      // Indigo Purple
  secondaryLight: 'rgba(99, 102, 241, 0.12)',
  success: '#16A34A',        // High-contrast Forest Green
  error: '#DC2626',          // Warning Red
  accent: '#0284C7',         // Tech Blue Accent

  background: '#F4F4F5',     // Clean Light Zinc Canvas
  surface: '#FFFFFF',        // Pure White Cards
  surfaceLight: '#E4E4E7',   // Light Zinc for sub-elements
  border: '#E4E4E7',         // Subtle Borders
  borderLight: '#D4D4D8',    // Visible Borders

  textPrimary: '#09090B',    // Deep Near-Black Headings & Values
  textSecondary: '#52525B',  // Zinc Gray Labels
  textMuted: '#71717A',      // Muted Captions

  paperBackground: '#FFFDF0', // Authentic Cream Thermal POS Paper (Preserved in Light mode)
  paperBorder: '#D4CEB0',
  paperText: '#111111',
  paperMuted: '#555555',
};

// Default export alias for static contexts
export const Colors = DarkTheme;
