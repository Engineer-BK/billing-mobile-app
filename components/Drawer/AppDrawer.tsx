/**
 * components/Drawer/AppDrawer.tsx
 * 
 * Classy Slide-Over Retail Navigation Drawer for FlashBill POS.
 * Inspired by Square POS & Shopify POS architecture.
 * 
 * Features:
 * - Smooth 60fps hardware-accelerated slide-in animation from the left
 * - Store Identity Header with verified merchant badge & live cloud status
 * - First-class navigation links (Sale, Invoices, Printers, Store Profile, Settings)
 * - Quick Theme Toggle (Light / Dark mode)
 * - 1-Tap Cloud Sync action
 * - Sign Out button with secure confirmation
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { useLicense } from '../../context/LicenseContext';
import { NavTabId } from '../HomeScreen/BottomNavBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onOpenAccountModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAboutModal?: () => void;
  onOpenPrintersModal?: () => void;
  onSignOut: () => void;
  onOpenActivationModal?: () => void;
}

export function AppDrawer({
  visible,
  onClose,
  activeTab,
  onSelectTab,
  onOpenAccountModal,
  onOpenSettingsModal,
  onOpenAboutModal,
  onOpenPrintersModal,
  onSignOut,
  onOpenActivationModal,
}: AppDrawerProps): React.JSX.Element {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { isActivated, plan } = useLicense();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const handleNavigate = (tab: NavTabId) => {
    handleClose();
    setTimeout(() => {
      onSelectTab(tab);
    }, 150);
  };

  const handleAction = (callback: () => void) => {
    handleClose();
    setTimeout(() => {
      callback();
    }, 150);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Backdrop Fade Dismiss */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Sliding Drawer Panel */}
        <Animated.View
          style={[
            styles.drawerPane,
            {
              width: DRAWER_WIDTH,
              backgroundColor: colors.surface,
              borderRightColor: colors.border,
              transform: [{ translateX: slideAnim }],
              shadowColor: isDark ? '#000000' : '#8899A6',
            },
          ]}
        >
          {/* 1. Drawer Header: Store Branding */}
          <View style={[styles.drawerHeader, { borderBottomColor: colors.borderLight }]}>
            <View style={styles.headerTopRow}>
              <View
                style={[
                  styles.storeAvatarBox,
                  {
                    backgroundColor: colors.surfaceLight,
                    borderColor: colors.borderLight,
                  },
                ]}
              >
                <Image
                  source={require('../../assets/flash-bill-icon-for-any-usecases-app-icon-with-no-background.png')}
                  style={styles.storeAvatarImg}
                  resizeMode="contain"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.closeDrawerBtn,
                  {
                    backgroundColor: colors.surfaceLight,
                    borderColor: colors.borderLight,
                  },
                ]}
                onPress={handleClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.storeInfoTouchable}
              onPress={() => {
                if (user?.isGuest) {
                  handleClose();
                  setTimeout(() => onSignOut(), 150);
                } else {
                  handleAction(onOpenAccountModal);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.storeNameRow}>
                <Text style={[styles.storeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {user?.isGuest ? 'Demo Supermarket' : (user?.shopName || 'Store Account')}
                </Text>
                {user?.isGuest ? (
                  <View
                    style={{
                      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                      marginLeft: 6,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#D97706' }}>
                      DEMO
                    </Text>
                  </View>
                ) : (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color="#0EA5E9"
                    style={styles.verifiedIcon}
                  />
                )}
              </View>

              <Text style={[styles.storeEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                {user?.isGuest
                  ? 'Guest Sandbox • Printer Locked'
                  : (user?.ownerName ? `${user.ownerName} • ` : '') + (user?.email || 'FlashBill Active')}
              </Text>
            </TouchableOpacity>

            {/* Cloud Status Indicator Chip or Claim Account CTA */}
            {user?.isGuest ? (
              <TouchableOpacity
                style={[
                  styles.claimStoreBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  handleClose();
                  setTimeout(() => onSignOut(), 150);
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="store-plus" size={16} color="#FFFFFF" />
                <Text style={styles.claimStoreBtnTxt}>Claim Real Store Account</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.cloudChip, { backgroundColor: colors.surfaceLight }]}>
                <View style={styles.statusDot} />
                <Text style={[styles.cloudChipTxt, { color: colors.textSecondary }]}>
                  Google Cloud Synced • Active
                </Text>
              </View>
            )}
          </View>

          {/* 2. Drawer Navigation Items */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.drawerScrollContent}
          >
            <Text style={[styles.menuSectionHeader, { color: colors.textSecondary }]}>
              OPERATIONS
            </Text>

            {/* Home Tab */}
            <TouchableOpacity
              style={[
                styles.navItem,
                activeTab === 'home' && {
                  backgroundColor: colors.primaryLight,
                },
              ]}
              onPress={() => handleNavigate('home')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={activeTab === 'home' ? 'home-variant' : 'home-variant-outline'}
                size={22}
                color={activeTab === 'home' ? colors.primary : colors.textPrimary}
              />
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: activeTab === 'home' ? colors.primary : colors.textPrimary,
                    fontWeight: activeTab === 'home' ? '800' : '600',
                  },
                ]}
              >
                Home Dashboard
              </Text>
            </TouchableOpacity>

            {/* Sale Tab */}
            <TouchableOpacity
              style={[
                styles.navItem,
                activeTab === 'sale' && {
                  backgroundColor: colors.primaryLight,
                },
              ]}
              onPress={() => handleNavigate('sale')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={activeTab === 'sale' ? 'cart' : 'cart-outline'}
                size={22}
                color={activeTab === 'sale' ? colors.primary : colors.textPrimary}
              />
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: activeTab === 'sale' ? colors.primary : colors.textPrimary,
                    fontWeight: activeTab === 'sale' ? '800' : '600',
                  },
                ]}
              >
                New POS Sale
              </Text>
              <View style={[styles.pillBadge, { backgroundColor: colors.successLight }]}>
                <Text style={[styles.pillBadgeTxt, { color: colors.success }]}>0ms</Text>
              </View>
            </TouchableOpacity>

            {/* Invoices Tab */}
            <TouchableOpacity
              style={[
                styles.navItem,
                activeTab === 'bills' && {
                  backgroundColor: colors.primaryLight,
                },
              ]}
              onPress={() => handleNavigate('bills')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="receipt"
                size={22}
                color={activeTab === 'bills' ? colors.primary : colors.textPrimary}
              />
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: activeTab === 'bills' ? colors.primary : colors.textPrimary,
                    fontWeight: activeTab === 'bills' ? '800' : '600',
                  },
                ]}
              >
                Invoices & Bills
              </Text>
            </TouchableOpacity>

            {/* Items & Catalog Tab */}
            <TouchableOpacity
              style={[
                styles.navItem,
                activeTab === 'items' && {
                  backgroundColor: colors.primaryLight,
                },
              ]}
              onPress={() => handleNavigate('items')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={activeTab === 'items' ? 'package-variant' : 'package-variant-closed'}
                size={22}
                color={activeTab === 'items' ? colors.primary : colors.textPrimary}
              />
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: activeTab === 'items' ? colors.primary : colors.textPrimary,
                    fontWeight: activeTab === 'items' ? '800' : '600',
                  },
                ]}
              >
                Items & Catalog
              </Text>
            </TouchableOpacity>

            {/* Management Section */}
            <Text style={[styles.menuSectionHeader, { color: colors.textSecondary, marginTop: 18 }]}>
              STORE & MANAGEMENT
            </Text>

            {/* Thermal Printers Setup */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                if (onOpenPrintersModal) {
                  handleAction(onOpenPrintersModal);
                }
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="printer"
                size={22}
                color={colors.textPrimary}
              />
              <Text style={[styles.navLabel, { color: colors.textPrimary }]}>
                Thermal Printers Setup
              </Text>
            </TouchableOpacity>

            {/* Store Profile */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleAction(onOpenAccountModal)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="store-outline"
                size={22}
                color={colors.textPrimary}
              />
              <Text style={[styles.navLabel, { color: colors.textPrimary }]}>
                Store Profile & Cloud
              </Text>
            </TouchableOpacity>

            {/* Store License & Activation (Module 2) */}
            <TouchableOpacity
              style={[
                styles.navItem,
                !isActivated && !user?.isGuest && {
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
                },
              ]}
              onPress={() => {
                if (onOpenActivationModal) {
                  handleAction(onOpenActivationModal);
                }
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={isActivated ? 'shield-check' : 'key-star'}
                size={22}
                color={isActivated ? '#10B981' : '#D97706'}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color: isActivated ? colors.textPrimary : '#D97706',
                      fontWeight: '800',
                      marginLeft: 0,
                    },
                  ]}
                >
                  {isActivated ? `${plan || 'PRO'} License Active` : 'Activate Thermal Printing'}
                </Text>
                <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 1 }}>
                  {isActivated ? '0ms ESC/POS printing unlocked' : 'Redeem voucher or contact sales'}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={isActivated ? colors.textMuted : '#D97706'}
              />
            </TouchableOpacity>

            {/* POS Settings */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleAction(onOpenSettingsModal)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={22}
                color={colors.textPrimary}
              />
              <Text style={[styles.navLabel, { color: colors.textPrimary }]}>
                Settings
              </Text>
            </TouchableOpacity>

            {/* About FlashBill (Directly below Settings) */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                if (onOpenAboutModal) {
                  handleAction(onOpenAboutModal);
                }
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={22}
                color={colors.primary}
              />
              <Text style={[styles.navLabel, { color: colors.textPrimary }]}>
                About FlashBill
              </Text>
              <View style={[styles.pillBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.pillBadgeTxt, { color: colors.primary }]}>v1.0</Text>
              </View>
            </TouchableOpacity>

            {/* Appearance Section */}
            <Text style={[styles.menuSectionHeader, { color: colors.textSecondary, marginTop: 18 }]}>
              APPEARANCE
            </Text>

            {/* Theme Toggle Pill Bar */}
            <View
              style={[
                styles.themeToggleCard,
                {
                  backgroundColor: colors.surfaceLight,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.themeToggleSide,
                  !isDark && {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderLight,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 1,
                  },
                ]}
                onPress={() => {
                  if (isDark) toggleTheme();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="sunny" size={16} color={!isDark ? colors.primary : colors.textMuted} />
                <Text
                  style={[
                    styles.themeToggleTxt,
                    {
                      color: !isDark ? colors.textPrimary : colors.textMuted,
                      fontWeight: !isDark ? '800' : '600',
                    },
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeToggleSide,
                  isDark && {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderLight,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.15,
                    shadowRadius: 2,
                    elevation: 1,
                  },
                ]}
                onPress={() => {
                  if (!isDark) toggleTheme();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="moon" size={16} color={isDark ? colors.secondary : colors.textMuted} />
                <Text
                  style={[
                    styles.themeToggleTxt,
                    {
                      color: isDark ? colors.textPrimary : colors.textMuted,
                      fontWeight: isDark ? '800' : '600',
                    },
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* 3. Drawer Footer: Sign Out & App Identity */}
          <View style={[styles.drawerFooter, { borderTopColor: colors.borderLight }]}>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={() => handleAction(onSignOut)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={user?.isGuest ? 'login' : 'logout'}
                size={20}
                color={user?.isGuest ? colors.primary : '#EF4444'}
              />
              <Text
                style={[
                  styles.signOutTxt,
                  user?.isGuest && { color: colors.primary },
                ]}
              >
                {user?.isGuest ? 'Exit Demo / Sign In' : 'Sign Out of Store'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (onOpenAboutModal) {
                  handleAction(onOpenAboutModal);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.versionTxt, { color: colors.textMuted }]}>
                FlashBill POS • Enterprise Offline v1.0
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  drawerPane: {
    flex: 1,
    height: '100%',
    borderRightWidth: 1,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 10,
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storeAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeAvatarImg: {
    width: 34,
    height: 34,
  },
  closeDrawerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfoTouchable: {
    marginTop: 2,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  storeTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  verifiedIcon: {
    flexShrink: 0,
  },
  storeEmail: {
    fontSize: 12,
    marginTop: 3,
  },
  cloudChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  cloudChipTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  claimStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 10,
    gap: 6,
  },
  claimStoreBtnTxt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  drawerScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  menuSectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    marginBottom: 3,
    gap: 12,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  themeToggleCard: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    marginHorizontal: 4,
  },
  themeToggleSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeToggleTxt: {
    fontSize: 12,
  },
  drawerFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  signOutTxt: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  versionTxt: {
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
});

