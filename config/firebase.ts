/**
 * config/firebase.ts
 * 
 * Centralized Firebase Client configuration for FlashBill POS.
 * Services:
 * - Firebase App
 * - Firebase Authentication with AsyncStorage session persistence
 * - Cloud Firestore Database
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseConfig = {
  apiKey: "AIzaSyCMtGX1hNqDmCO_-AgjveDRt40pDtW-MoI",
  authDomain: "billing-mobile-app.firebaseapp.com",
  projectId: "billing-mobile-app",
  storageBucket: "billing-mobile-app.firebasestorage.app",
  messagingSenderId: "674033662205",
  appId: "1:674033662205:web:eba141611bfac8f57c2694",
  measurementId: "G-Z7E9Q37M31"
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with AsyncStorage session persistence
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // If already initialized during Fast Refresh / hot reload
  auth = getAuth(app);
}

// Initialize Cloud Firestore
const db = getFirestore(app);

export { app, auth, db };

