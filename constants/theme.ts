// theme.js - The High-Speed Retail Palette Configuration
export const Colors = {
  primary: '#F97316',      // Safety Orange (New Bill, Main Actions)
  secondary: '#6366F1',    // Indigo Purple (Secondary Buttons)
  success: '#22C55E',      // Emerald Green (Payment Clear, Printer Connected)
  background: '#09090B',   // Jet Pitch Black (App Canvas Base)
  surface: '#18181B',      // Dark Zinc Gray (Invoice Cards, Item Container Layouts)
  border: '#27272A',       // Subtle Divider/Borders
  textPrimary: '#FAFAFA',  // Crisp White (Item Names, Quantities)
  textSecondary: '#A1A1AA',// Slate Gray (Invoice Numbers, Timestamps, Labels)
  error: '#EF4444',        // Warning Red (Stock out, Disconnected Printer)
};

export const GlobalStyles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
};