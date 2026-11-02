/**
 * context/LicenseContext.tsx
 * 
 * Global Store Licensing & Thermal Printer Gating Context (Module 2).
 * 
 * Orchestrates:
 * - Real-time synchronization with Cloud Firestore (users/{uid} & licenses/{key})
 * - Immediate unlock on Remote Admin Switch ('canPrint: true')
 * - In-app Voucher Token redemption
 * - Global Activation Modal trigger
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { licenseService } from '../services/licenseService';
import {
  LicensePlan,
  LicenseVerificationResult,
  RedeemResult,
} from '../types/license';

interface LicenseContextType {
  isActivated: boolean;
  canPrint: boolean;
  plan: LicensePlan;
  licenseKey?: string;
  expiresAt?: number | null;
  isExpired?: boolean;
  isLoading: boolean;
  showActivationModal: boolean;
  openActivationModal: () => void;
  closeActivationModal: () => void;
  redeemVoucher: (key: string) => Promise<RedeemResult>;
  refreshLicense: () => Promise<void>;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const { user } = useAuth();

  const [licenseState, setLicenseState] = useState<LicenseVerificationResult>({
    isActivated: false,
    canPrint: false,
    plan: 'FREE',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showActivationModal, setShowActivationModal] = useState<boolean>(false);

  // Subscribe to real-time license updates from Cloud Firestore
  useEffect(() => {
    if (!user || user.isGuest) {
      setLicenseState({
        isActivated: false,
        canPrint: false,
        plan: 'FREE',
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // 1. Initial quick verification (with local cache fallback)
    licenseService.verifyStoreLicense(user.uid).then((res) => {
      setLicenseState(res);
      setIsLoading(false);
    });

    // 2. Real-time onSnapshot listener for 0.5s remote admin activation
    const unsubscribe = licenseService.subscribeToLicense(user.uid, (updated) => {
      setLicenseState(updated);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid, user?.isGuest]);

  // Refresh license manually
  const refreshLicense = useCallback(async () => {
    if (!user || user.isGuest) return;
    setIsLoading(true);
    const res = await licenseService.verifyStoreLicense(user.uid);
    setLicenseState(res);
    setIsLoading(false);
  }, [user]);

  // Redeem voucher token
  const redeemVoucher = useCallback(
    async (rawKey: string): Promise<RedeemResult> => {
      if (!user) {
        return {
          success: false,
          message: 'Please sign in to your store account before redeeming a voucher.',
        };
      }

      setIsLoading(true);
      const result = await licenseService.redeemVoucherToken(user.uid, rawKey, user);
      if (result.success && result.license) {
        setLicenseState({
          isActivated: true,
          canPrint: true,
          plan: result.license.plan || 'LIFETIME',
          licenseKey: result.license.key,
          expiresAt: result.license.expiresAt || null,
          isExpired: false,
        });
      }
      setIsLoading(false);
      return result;
    },
    [user]
  );

  const openActivationModal = useCallback(() => {
    setShowActivationModal(true);
  }, []);

  const closeActivationModal = useCallback(() => {
    setShowActivationModal(false);
  }, []);

  return (
    <LicenseContext.Provider
      value={{
        isActivated: licenseState.isActivated,
        canPrint: licenseState.canPrint,
        plan: licenseState.plan,
        licenseKey: licenseState.licenseKey,
        expiresAt: licenseState.expiresAt,
        isExpired: licenseState.isExpired,
        isLoading,
        showActivationModal,
        openActivationModal,
        closeActivationModal,
        redeemVoucher,
        refreshLicense,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense(): LicenseContextType {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}

