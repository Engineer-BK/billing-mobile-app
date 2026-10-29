// constants/theme.ts - High-Speed Retail Branding System
export const Colors = {
  // Brand Accents
  primary: '#F97316',        // Safety Orange (Main CTAs, Active States)
  primaryLight: 'rgba(249, 115, 22, 0.15)', // Muted orange highlight
  secondary: '#6366F1',      // Indigo Purple (Secondary actions, badges)
  secondaryLight: 'rgba(99, 102, 241, 0.15)',
  success: '#22C55E',        // Emerald Green (Connected state, Push Print CTA)
  error: '#EF4444',          // Warning Red (Disconnect, Delete Item)
  accent: '#00D2FF',         // Cyan / Monospace Tag Accent
  
  // Surfaces & Layout
  background: '#09090B',     // Jet Pitch Black (App Canvas Base)
  surface: '#18181B',        // Dark Zinc Gray (Cards, Form Container)
  surfaceLight: '#27272A',   // Lighter Zinc (Sub-buttons, badges, tab base)
  border: '#27272A',         // Subtle Borders
  borderLight: '#3F3F46',    // Visible Borders

  // Typography
  textPrimary: '#FAFAFA',    // Crisp White (Headings, Item Names, Primary Values)
  textSecondary: '#A1A1AA',  // Slate Gray (Labels, Metadata, Timestamps)
  textMuted: '#71717A',      // Muted Gray (Captions, Placeholders)

  // Authentic Thermal Paper Realism
  paperBackground: '#FFFDF0', // Authentic Cream Thermal Paper
  paperBorder: '#D4CEB0',     // Subtle Paper Border
  paperText: '#111111',       // High-contrast POS Ink
  paperMuted: '#555555',      // Secondary POS Ink
};

export const GlobalStyles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printButton: {
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
};
