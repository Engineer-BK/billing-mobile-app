/**
 * context/AuthContext.tsx
 * 
 * Central Authentication & User Store Context for FlashBill POS.
 * Integrated with Google Firebase Authentication & Cloud Firestore (Module 2).
 * 
 * Features:
 * - Real Firebase Auth (signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail)
 * - Persistent session tracking via AsyncStorage
 * - Automatic Firestore profile sync (Shop Name, Owner Name, Contact Phone)
 * - Multi-device history pull on login
 * - Retail-friendly error mapping
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { UserProfile, AuthContextType } from '../types/auth';
import { storageService } from '../services/storageService';
import { syncService } from '../services/syncService';

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

function parseFirebaseError(err: any, fallback: string): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please verify and try again.';
    case 'auth/user-not-found':
      return 'No store account registered with this email. Please register.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Access temporarily restricted. Try again later.';
    default:
      return err?.message || fallback;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore active user session on app launch
  useEffect(() => {
    let isMounted = true;

    async function initializeAuthSession() {
      try {
        // 1. Fast local cache restore (0ms screen launch)
        const cachedUser = await storageService.loadUserSession();
        if (cachedUser && isMounted) {
          setUser(cachedUser);
        }

        // 2. Listen for Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!isMounted) return;

          if (firebaseUser) {
            try {
              // Attempt to fetch latest profile from Firestore
              const cloudProfile = await syncService.getUserProfile(firebaseUser.uid);
              const resolvedUser: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || cachedUser?.email || '',
                shopName: cloudProfile?.shopName || cachedUser?.shopName || 'Store Account',
                ownerName: cloudProfile?.ownerName || cachedUser?.ownerName || 'Store Owner',
                phone: cloudProfile?.phone || cachedUser?.phone || '',
                createdAt: cloudProfile?.createdAt || cachedUser?.createdAt || new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
              };

              await storageService.saveUserSession(resolvedUser);
              if (isMounted) setUser(resolvedUser);
            } catch (err) {
              console.warn('Profile fetch notice on auth change:', err);
            }
          } else {
            // User signed out in Firebase
            if (!cachedUser) {
              if (isMounted) setUser(null);
            }
          }
          if (isMounted) setIsLoading(false);
        });

        return () => {
          unsubscribe();
        };
      } catch (err) {
        console.warn('Failed to initialize auth session:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    initializeAuthSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Sign In with Email & Password via Firebase Auth
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

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        const msg = 'Please enter a valid email address.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
        const uid = userCredential.user.uid;

        // Fetch cloud profile from Firestore
        let cloudProfile = await syncService.getUserProfile(uid);
        
        // Multi-device restore: Pull existing invoices from Cloud Firestore
        await syncService.pullAllInvoices(uid);

        const activeProfile: UserProfile = {
          uid,
          email: trimmedEmail,
          shopName: cloudProfile?.shopName || 'Store Account',
          ownerName: cloudProfile?.ownerName || trimmedEmail.split('@')[0].toUpperCase(),
          phone: cloudProfile?.phone || '',
          createdAt: cloudProfile?.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        // Cache session locally
        await storageService.saveUserSession(activeProfile);
        setUser(activeProfile);
        setIsLoading(false);
        return { success: true };
      } catch (err: any) {
        console.warn('Firebase signIn error:', err);
        const friendlyMsg = parseFirebaseError(err, 'Sign in failed. Please try again.');
        setError(friendlyMsg);
        setIsLoading(false);
        return { success: false, error: friendlyMsg };
      }
    },
    []
  );

  /**
   * Register New Store Account via Firebase Auth & Firestore
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
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
        const uid = userCredential.user.uid;

        const newProfile: UserProfile = {
          uid,
          email: trimmedEmail,
          shopName: trimmedShop,
          ownerName: trimmedOwner || 'Store Owner',
          phone: trimmedPhone,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        // Save profile to Cloud Firestore
        await syncService.saveUserProfile(uid, newProfile);

        // Cache session locally
        await storageService.saveUserSession(newProfile);
        setUser(newProfile);
        setIsLoading(false);
        return { success: true };
      } catch (err: any) {
        console.warn('Firebase signUp error:', err);
        const friendlyMsg = parseFirebaseError(err, 'Registration failed.');
        setError(friendlyMsg);
        setIsLoading(false);
        return { success: false, error: friendlyMsg };
      }
    },
    []
  );

  /**
   * Sign Out of Firebase Auth & Clear Local Storage
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      await storageService.clearUserSession();
      setUser(null);
      setError(null);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  }, []);

  /**
   * Update Profile Details in Firestore and AsyncStorage
   */
  const updateProfile = useCallback(
    async (data: Partial<UserProfile>): Promise<boolean> => {
      if (!user) return false;
      try {
        const updated: UserProfile = {
          ...user,
          ...data,
        };
        await syncService.saveUserProfile(user.uid, data);
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
   * Send Password Reset Email via Firebase
   */
  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      try {
        await sendPasswordResetEmail(auth, trimmedEmail);
        return {
          success: true,
          message: `Password reset link sent to ${trimmedEmail}. Please check your inbox.`,
        };
      } catch (err: any) {
        console.warn('Firebase resetPassword error:', err);
        const friendlyMsg = parseFirebaseError(err, 'Could not send reset email. Verify your email.');
        return { success: false, error: friendlyMsg };
      }
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
