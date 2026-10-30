// constants/theme.ts - FlashBill Official Branding System
// Extracted directly from flashBill2.png logo & reference POS designs:
// - Primary: Electric Blue (#0284C7 / #0EA5E9) - The Digital Invoice Emblem & Primary CTAs
// - Secondary: Lightning Gold (#F59E0B / #FACC15) - High-Voltage Flash Lightning Bolt
// - Background: Midnight Navy (#0A1322 / #0F172A) - FlashBill App Icon Squircle Canvas
// - Success: Emerald Green (#10B981 / #16A34A) - Credit Mode & Print Ready
// - Error: Crimson Red (#EF4444 / #DC2626) - Danger / None Prefix Pill

export interface ThemeColors {
  // Brand Accents
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  accent: string;
  flashGold: string;

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
  // FlashBill Brand Identity
  primary: '#0EA5E9',          // Vibrant Electric Sky Blue (Logo Document & Active Elements)
  primaryLight: 'rgba(14, 165, 233, 0.16)',
  secondary: '#F59E0B',        // High-Voltage Lightning Gold (Logo Flash Bolt)
  secondaryLight: 'rgba(245, 158, 11, 0.16)',
  success: '#10B981',          // Emerald Green (Payment Clear, Printer Connected, Credit Mode)
  successLight: 'rgba(16, 185, 129, 0.16)',
  error: '#EF4444',            // Crimson Red (Delete, Disconnect, None Prefix)
  errorLight: 'rgba(239, 68, 68, 0.16)',
  accent: '#00D2FF',           // High-Voltage Cyan Glow
  flashGold: '#FACC15',        // Electric Bolt Yellow

  // Midnight Navy Canvas (Matching flashBill2.png squircle background #112037)
  background: '#0A1322',       // Deep Midnight Navy Canvas
  surface: '#111D32',          // Elevated Slate Navy Card Surface
  surfaceLight: '#1E293B',     // Active Slate Container
  border: '#1E293B',           // Subtle Dark Border
  borderLight: '#334155',      // Defined Slate Border

  // Typography
  textPrimary: '#F8FAFC',      // Crisp Off-White Headings & Values
  textSecondary: '#94A3B8',    // Slate Gray Labels & Timestamps
  textMuted: '#64748B',        // Muted Slate Captions

  // Authentic Thermal Paper Realism (Always Cream in both modes)
  paperBackground: '#FFFDF0',   // Authentic Cream Thermal POS Paper
  paperBorder: '#D4CEB0',
  paperText: '#111111',
  paperMuted: '#555555',
};

export const LightTheme: ThemeColors = {
  // FlashBill Brand Identity
  primary: '#0284C7',          // High-Contrast Electric Tech Blue (Matches Screenshot Save CTA)
  primaryLight: 'rgba(2, 132, 199, 0.12)',
  secondary: '#D97706',        // Warm Amber Gold (Flash Lightning Accent)
  secondaryLight: 'rgba(217, 119, 6, 0.12)',
  success: '#059669',          // Deep Emerald Green (Credit Mode & Print Ready)
  successLight: 'rgba(5, 150, 105, 0.12)',
  error: '#DC2626',            // Crimson Red
  errorLight: 'rgba(220, 38, 38, 0.12)',
  accent: '#0284C7',           // Tech Blue Accent
  flashGold: '#EAB308',        // Golden Amber

  // Clean Slate Light Canvas
  background: '#F8FAFC',       // Clean Slate Canvas
  surface: '#FFFFFF',          // Pure White Cards
  surfaceLight: '#F1F5F9',     // Subtle Slate Gray Container
  border: '#E2E8F0',           // Crisp Light Border
  borderLight: '#CBD5E1',      // Defined Slate Border

  // Typography
  textPrimary: '#0F172A',      // Deep Slate Black Headings & Values
  textSecondary: '#475569',    // Slate Gray Labels
  textMuted: '#94A3B8',        // Muted Captions

  // Authentic Thermal Paper Realism (Preserved in Light mode)
  paperBackground: '#FFFDF0',   // Authentic Cream Thermal POS Paper
  paperBorder: '#D4CEB0',
  paperText: '#111111',
  paperMuted: '#555555',
};

// Default export alias for static contexts
export const Colors = DarkTheme;
