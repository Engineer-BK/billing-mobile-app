/**
 * types/auth.ts
 * 
 * Authentication and User/Store Profile type definitions.
 */

export interface UserProfile {
  uid: string;
  email: string;
  shopName: string;
  ownerName: string;
  phone: string;
  isGuest?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    shopName: string;
    ownerName: string;
    phone: string;
    email: string;
    pass: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  clearError: () => void;
}

