/**
 * types/license.ts
 * 
 * Commercialization, Voucher Tokens & Store Licensing Type Definitions.
 */

export type LicensePlan = 'FREE' | '1_YEAR' | 'LIFETIME';
export type LicenseStatus = 'AVAILABLE' | 'CLAIMED' | 'REVOKED';

export interface StoreLicense {
  key: string;                       // Formatted key: CP-XXXX-XXXX-XXXX
  plan: LicensePlan;                 // 'LIFETIME' | '1_YEAR'
  status: LicenseStatus;             // 'AVAILABLE' | 'CLAIMED' | 'REVOKED'
  claimedByUid?: string;             // Firebase Auth UID of Merchant
  claimedByEmail?: string;           // Store Email
  claimedByShopName?: string;        // Store Name
  claimedAt?: number;                // Activation timestamp
  expiresAt?: number | null;         // Expiration timestamp; null for Lifetime
  maxPrinters?: number;              // Printer entitlement (default: 1)
  notes?: string;
}

export interface LicenseVerificationResult {
  isActivated: boolean;
  canPrint: boolean;
  plan: LicensePlan;
  licenseKey?: string;
  expiresAt?: number | null;
  isExpired?: boolean;
  message?: string;
}

export interface RedeemResult {
  success: boolean;
  message: string;
  license?: StoreLicense;
  error?: string;
}

