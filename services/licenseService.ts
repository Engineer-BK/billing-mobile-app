/**
 * services/licenseService.ts
 * 
 * Commercialization, Voucher Token Redemption & Store Licensing Service (Module 2).
 * 
 * Supports Two Complementary Activation Models:
 * 1. Method A: Voucher Token Redemption (Client enters 16-character alphanumeric key).
 * 2. Method B: Remote Admin Switch (Owner flips 'canPrint: true' in Firebase Console; unlocks in 0.5s).
 */

import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { storageService } from './storageService';
import {
  StoreLicense,
  LicenseVerificationResult,
  RedeemResult,
} from '../types/license';
import { UserProfile } from '../types/auth';

export const ADMIN_EMAIL = 'bachirak47@gmail.com'; // Official Admin Email
export const ADMIN_WHATSAPP_PHONE = '918638514961'; // Official Admin WhatsApp number

/**
 * Robust helper: checks whether the store document is flagged active across
 * all common field naming conventions (canPrint, isActivated, isActive, active, status)
 * supporting both boolean (true) and string ("true") values from Firebase Console.
 */
function parseActivationFlag(data?: Record<string, any>): boolean {
  if (!data) return false;
  return (
    data.canPrint === true ||
    data.canPrint === 'true' ||
    data.canPrint === 1 ||
    data.isActivated === true ||
    data.isActivated === 'true' ||
    data.isActivated === 1 ||
    data.isActive === true ||
    data.isActive === 'true' ||
    data.isActive === 1 ||
    data.active === true ||
    data.active === 'true' ||
    data.active === 1 ||
    data.is_active === true ||
    data.is_active === 'true' ||
    data.status === 'ACTIVE' ||
    data.status === 'active' ||
    data.status === 'CLAIMED'
  );
}

export const licenseService = {
  /**
   * Format raw input into readable voucher chunks:
   * Supports:
   * 1. Branded keys: "CP-XXXX-XXXX-XXXX" or "COUNTER-XXXX-XXXX-XXXX" or "FLASH-XXXX-XXXX-XXXX"
   * 2. Standard keys: "XXXX-XXXX-XXXX-XXXX"
   */
  formatLicenseKey(raw: string): string {
    const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleaned) return '';

    // Handle "COUNTER" branded prefix: COUNTER-XXXX-XXXX-XXXX
    if (cleaned.startsWith('COUNTER')) {
      const rest = cleaned.substring(7);
      const parts = ['COUNTER'];
      for (let i = 0; i < rest.length && parts.length < 4; i += 4) {
        parts.push(rest.substring(i, i + 4));
      }
      return parts.join('-');
    }

    // Handle "CP" branded prefix: CP-XXXX-XXXX-XXXX
    if (cleaned.startsWith('CP')) {
      const rest = cleaned.substring(2);
      const parts = ['CP'];
      for (let i = 0; i < rest.length && parts.length < 4; i += 4) {
        parts.push(rest.substring(i, i + 4));
      }
      return parts.join('-');
    }

    // Handle legacy "FLASH" branded prefix: FLASH-XXXX-XXXX-XXXX
    if (cleaned.startsWith('FLASH')) {
      const rest = cleaned.substring(5);
      const parts = ['FLASH'];
      for (let i = 0; i < rest.length && parts.length < 4; i += 4) {
        parts.push(rest.substring(i, i + 4));
      }
      return parts.join('-');
    }

    // Standard 16-character alphanumeric: XXXX-XXXX-XXXX-XXXX
    const parts: string[] = [];
    for (let i = 0; i < cleaned.length && parts.length < 4; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    return parts.join('-');
  },

  /**
   * Verify store license from Cloud Firestore with local cache fallback.
   */
  async verifyStoreLicense(userId: string): Promise<LicenseVerificationResult> {
    if (!userId || userId === 'guest_user') {
      return {
        isActivated: false,
        canPrint: false,
        plan: 'FREE',
        message: 'Guest demo mode (printer locked).',
      };
    }

    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        const canPrint = parseActivationFlag(data);
        const plan = (data.plan as any) || (canPrint ? 'LIFETIME' : 'FREE');
        const expiresAt = typeof data.expiresAt === 'number' ? data.expiresAt : null;

        // Check if annual subscription is expired
        const isExpired = expiresAt !== null && Date.now() > expiresAt;
        const finalActive = canPrint && !isExpired;

        const result: LicenseVerificationResult = {
          isActivated: finalActive,
          canPrint: finalActive,
          plan: finalActive ? plan : 'FREE',
          licenseKey: data.licenseKey || undefined,
          expiresAt: expiresAt,
          isExpired: isExpired,
          message: isExpired
            ? 'Your store license has expired. Please renew your plan.'
            : finalActive
            ? 'Store activated and licensed for thermal printing.'
            : 'Free tier store. Activate to enable thermal printing.',
        };

        // Cache locally for offline availability
        await storageService.saveLocalLicense(result);
        return result;
      }
    } catch (err) {
      console.warn('verifyStoreLicense cloud fetch error, falling back to cache:', err);
    }

    // Offline fallback to local cache
    const cached = await storageService.loadLocalLicense();
    if (cached) {
      return cached;
    }

    return {
      isActivated: false,
      canPrint: false,
      plan: 'FREE',
      message: 'Offline free mode.',
    };
  },

  /**
   * Subscribe to real-time license updates on the user's document.
   * Enables instant unlock when an admin flips 'canPrint: true' remotely in Firebase Console.
   */
  subscribeToLicense(
    userId: string,
    onUpdate: (result: LicenseVerificationResult) => void
  ): Unsubscribe {
    if (!userId || userId === 'guest_user') {
      onUpdate({
        isActivated: false,
        canPrint: false,
        plan: 'FREE',
      });
      return () => {};
    }

    try {
      const userRef = doc(db, 'users', userId);
      return onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const canPrint = parseActivationFlag(data);
            const plan = (data.plan as any) || (canPrint ? 'LIFETIME' : 'FREE');
            const expiresAt = typeof data.expiresAt === 'number' ? data.expiresAt : null;
            const isExpired = expiresAt !== null && Date.now() > expiresAt;
            const finalActive = canPrint && !isExpired;

            const result: LicenseVerificationResult = {
              isActivated: finalActive,
              canPrint: finalActive,
              plan: finalActive ? plan : 'FREE',
              licenseKey: data.licenseKey || undefined,
              expiresAt: expiresAt,
              isExpired: isExpired,
            };

            storageService.saveLocalLicense(result);
            onUpdate(result);
          }
        },
        (error) => {
          console.warn('License onSnapshot error:', error);
        }
      );
    } catch (err) {
      console.warn('subscribeToLicense error:', err);
      return () => {};
    }
  },

  /**
   * Redeem a 16-character alphanumeric Voucher Token (Method A).
   * Validates in Firestore collection 'licenses/{key}', marks CLAIMED, and binds to store UID.
   */
  async redeemVoucherToken(
    userId: string,
    rawKey: string,
    userProfile?: UserProfile | null
  ): Promise<RedeemResult> {
    if (!userId || userId === 'guest_user') {
      return {
        success: false,
        message: 'Guest users cannot claim licenses. Please create or sign into your store account first.',
      };
    }

    const formattedKey = this.formatLicenseKey(rawKey);
    if (!formattedKey || formattedKey.length < 14) {
      return {
        success: false,
        message: 'Invalid license format. Please enter a valid voucher code (e.g. CP-XXXX-XXXX-XXXX).',
      };
    }

    try {
      const licenseRef = doc(db, 'licenses', formattedKey);
      const snap = await getDoc(licenseRef);

      if (!snap.exists()) {
        return {
          success: false,
          message: 'Activation voucher not found. Please double-check your code or contact support.',
        };
      }

      const licenseData = snap.data() as StoreLicense;

      // Status Check: CLAIMED
      if (licenseData.status === 'CLAIMED') {
        if (licenseData.claimedByUid === userId) {
          // Already claimed by this user - ensure local profile is unlocked
          await this.applyActivationToUser(userId, formattedKey, licenseData, userProfile);
          return {
            success: true,
            message: 'Your store has already claimed this license! Thermal printing is unlocked.',
            license: licenseData,
          };
        }
        return {
          success: false,
          message: 'This activation voucher has already been claimed by another store account.',
        };
      }

      // Status Check: REVOKED
      if (licenseData.status === 'REVOKED') {
        return {
          success: false,
          message: 'This license key has been deactivated by the system administrator.',
        };
      }

      // Status Check: AVAILABLE -> Claim Key
      const now = Date.now();
      await updateDoc(licenseRef, {
        status: 'CLAIMED',
        claimedByUid: userId,
        claimedByEmail: userProfile?.email || '',
        claimedByShopName: userProfile?.shopName || '',
        claimedAt: now,
      });

      // Update user account
      await this.applyActivationToUser(userId, formattedKey, licenseData, userProfile);

      return {
        success: true,
        message: `Congratulations! Your store is successfully activated (${licenseData.plan || 'LIFETIME'} Plan). Thermal printing is unlocked!`,
        license: {
          ...licenseData,
          status: 'CLAIMED',
          claimedByUid: userId,
          claimedAt: now,
        },
      };
    } catch (err: any) {
      console.warn('redeemVoucherToken error:', err);
      return {
        success: false,
        message: err.message || 'Unable to connect to license server. Please check your internet connection.',
      };
    }
  },

  /**
   * Internal helper: write activation flags to users/{userId}
   */
  async applyActivationToUser(
    userId: string,
    key: string,
    license: StoreLicense,
    userProfile?: UserProfile | null
  ): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const plan = license.plan || 'LIFETIME';
    const expiresAt = license.expiresAt || null;

    await updateDoc(userRef, {
      isActivated: true,
      canPrint: true,
      plan: plan,
      licenseKey: key,
      activatedAt: Date.now(),
      expiresAt: expiresAt,
    });

    const verification: LicenseVerificationResult = {
      isActivated: true,
      canPrint: true,
      plan: plan,
      licenseKey: key,
      expiresAt: expiresAt,
      isExpired: false,
      message: 'Store activated successfully.',
    };

    await storageService.saveLocalLicense(verification);
  },

  /**
   * Build Email support/purchase link with pre-filled subject and body.
   */
  getEmailSalesUrl(shopName?: string, email?: string): string {
    const storeTxt = shopName ? `"${shopName}"` : 'my store';
    const emailTxt = email ? ` (${email})` : '';
    const subject = encodeURIComponent(
      `CounterPress POS - License Key Request (${shopName || 'Store Account'})`
    );
    const body = encodeURIComponent(
      `Hello Basir Khan,\n\nI want to purchase an activation license key for ${storeTxt}${emailTxt}.\nPlease share the UPI payment details and pricing.\n\nThank you!`
    );
    return `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
  },

  /**
   * Build WhatsApp support/purchase link with pre-filled message.
   */
  getWhatsAppSalesUrl(shopName?: string, email?: string): string {
    const storeTxt = shopName ? `"${shopName}"` : 'my store';
    const emailTxt = email ? ` (${email})` : '';
    const text = encodeURIComponent(
      `Hello CounterPress Team! 🚀\nI want to purchase an activation license key for ${storeTxt}${emailTxt}. Please share the UPI payment details and pricing.`
    );
    return `https://wa.me/${ADMIN_WHATSAPP_PHONE}?text=${text}`;
  },
};

