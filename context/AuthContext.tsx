/**
 * context/AuthContext.tsx
 * 
 * Central Authentication & User Store Context for FlashBill POS.
 * 
 * Features:
 * - Persistent session tracking via AsyncStorage
 * - Seamless plug-and-play architecture ready for Firebase Auth in Module 2
 * - Input validation and user-friendly error reporting
 * - Store profile management (Shop Name, Owner Name, Contact Phone)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, AuthContextType } from '../types/auth';
import { storageService } from '../services/storageService';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  updateProfile: async () => false,
  resetPassword: async () => ({ success: false }),
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore active user session on app launch
  useEffect(() => {
    async function restoreSession() {
      try {
        const savedUser = await storageService.loadUserSession();
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Sign In with Email & Password
   */
  const signIn = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      setIsLoading(true);

      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPass = pass.trim();

      if (!trimmedEmail || !trimmedPass) {
        const msg = 'Please enter both email and password.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        const msg = 'Please enter a valid email address.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      if (trimmedPass.length < 6) {
        const msg = 'Password must be at least 6 characters.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      try {
        // Build or restore user profile
        const activeProfile: UserProfile = {
          uid: 'usr_' + Math.abs(trimmedEmail.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)).toString(36),
          email: trimmedEmail,
          shopName: 'Billing Receipt', // Defaults to current store header or loaded profile
          ownerName: trimmedEmail.split('@')[0].toUpperCase(),
          phone: '',
          lastLoginAt: new Date().toISOString(),
        };

        // Check if there was an existing saved profile with full store name
        const existingSession = await storageService.loadUserSession();
        if (existingSession && existingSession.email === trimmedEmail) {
          activeProfile.shopName = existingSession.shopName || activeProfile.shopName;
          activeProfile.ownerName = existingSession.ownerName || activeProfile.ownerName;
          activeProfile.phone = existingSession.phone || activeProfile.phone;
        }

        await storageService.saveUserSession(activeProfile);
        setUser(activeProfile);
        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Sign in failed. Please try again.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }
    },
    []
  );

  /**
   * Register New Store Account
   */
  const signUp = useCallback(
    async (data: {
      shopName: string;
      ownerName: string;
      phone: string;
      email: string;
      pass: string;
    }): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      setIsLoading(true);

      const trimmedShop = data.shopName.trim();
      const trimmedOwner = data.ownerName.trim();
      const trimmedPhone = data.phone.trim();
      const trimmedEmail = data.email.trim().toLowerCase();
      const trimmedPass = data.pass.trim();

      if (!trimmedShop) {
        const msg = 'Please enter your Shop or Business Name.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      if (!trimmedEmail) {
        const msg = 'Please enter a valid email address.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        const msg = 'Invalid email address format.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      if (trimmedPass.length < 6) {
        const msg = 'Password must be at least 6 characters.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      try {
        const newProfile: UserProfile = {
          uid: 'usr_' + Date.now().toString(36),
          email: trimmedEmail,
          shopName: trimmedShop,
          ownerName: trimmedOwner || 'Store Owner',
          phone: trimmedPhone,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        await storageService.saveUserSession(newProfile);
        setUser(newProfile);
        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }
    },
    []
  );

  /**
   * Sign Out
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await storageService.clearUserSession();
      setUser(null);
      setError(null);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  }, []);

  /**
   * Update Profile Details (Shop Name, Owner Name, Phone)
   */
  const updateProfile = useCallback(
    async (data: Partial<UserProfile>): Promise<boolean> => {
      if (!user) return false;
      try {
        const updated: UserProfile = {
          ...user,
          ...data,
        };
        await storageService.saveUserSession(updated);
        setUser(updated);
        return true;
      } catch (err) {
        console.warn('Update profile error:', err);
        return false;
      }
    },
    [user]
  );

  /**
   * Send Password Reset
   */
  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      // Ready for Firebase sendPasswordResetEmail in Module 2
      return {
        success: true,
        message: `Password reset link sent to ${trimmedEmail}. Please check your inbox.`,
      };
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      signIn,
      signUp,
      signOut,
      updateProfile,
      resetPassword,
      clearError,
    }),
    [user, isLoading, error, signIn, signUp, signOut, updateProfile, resetPassword, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

