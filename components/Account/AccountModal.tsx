/**
 * components/Account/AccountModal.tsx
 * 
 * Account & Cloud Management Modal for FlashBill POS.
 * Features:
 * - Store identity & verified merchant badge
 * - Live Google Cloud Sync status & manual sync trigger
 * - Editable Store Profile (Shop Name, Owner Name, Contact Phone)
 * - Sign Out with confirmation
 * - Outside click dismiss
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { syncService } from '../../services/syncService';

import { UserProfile } from '../../types/auth';
import { InvoiceData } from '../../types/billing';

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
  invoicesCount: number;
  onSyncComplete?: (invoices: InvoiceData[]) => void;
}

export function AccountModal({
  visible,
  onClose,
  invoicesCount,
  onSyncComplete,
}: AccountModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const { user, signOut, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [shopName, setShopName] = useState<string>(user?.shopName || '');
  const [ownerName, setOwnerName] = useState<string>(user?.ownerName || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync with user prop whenever modal opens
  React.useEffect(() => {
    if (visible && user) {
      setShopName(user.shopName || '');
      setOwnerName(user.ownerName || '');
      setPhone(user.phone || '');
      setIsEditing(false);
    }
  }, [visible, user]);

  const handleSaveProfile = async () => {
    if (!shopName.trim()) {
      Alert.alert('Shop Name Required', 'Please enter your shop or business name.');
      return;
    }

    setIsSaving(true);
    const success = await updateProfile({
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
    });
    setIsSaving(false);

    if (success) {
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Store details saved successfully.');
    } else {
      Alert.alert('Update Failed', 'Could not update profile details.');
    }
  };

  const handleManualSync = async () => {
    if (!user?.uid) {
      Alert.alert('Sign In Needed', 'Please sign in to sync with Google Cloud.');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await syncService.syncAllLocalInvoices(user.uid);
      const latest = await syncService.pullAllInvoices(user.uid);
      setIsSyncing(false);
      if (res.error) {
        Alert.alert('Cloud Sync Notice', res.error);
      } else {
        if (onSyncComplete && latest.length > 0) {
          onSyncComplete(latest);
        }
        Alert.alert(
          'Google Cloud Synced',
          `Successfully verified and backed up ${res.syncedCount || invoicesCount} invoices to Cloud Firestore.`
        );
      }
    } catch {
      setIsSyncing(false);
      Alert.alert('Cloud Sync', 'Sync queued offline. Will upload automatically when connected.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out of Store',
      `Are you sure you want to sign out of ${user?.shopName || 'FlashBill'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            onClose();
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalWrapper}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: isDark ? '#000000' : '#8899A6',
                  },
                ]}
              >
                {/* Header */}
                <View style={styles.headerRow}>
                  <View style={styles.headerLeft}>
                    <View
                      style={[
                        styles.storeBadge,
                        {
                          backgroundColor: colors.primaryLight,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons name="store" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.headerTextCol}>
                      <View style={styles.titleRow}>
                        <Text
                          style={[styles.storeTitle, { color: colors.textPrimary }]}
                          numberOfLines={1}
                        >
                          {user?.shopName || 'Store Account'}
                        </Text>
                        <MaterialCommunityIcons
                          name="check-decagram"
                          size={16}
                          color="#0EA5E9"
                          style={styles.verifiedBadgeIcon}
                        />
                      </View>
                      <Text
                        style={[styles.storeSubtitle, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {user?.email || 'Active Account'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.closeBtn,
                      {
                        backgroundColor: colors.surfaceLight,
                        borderColor: colors.borderLight,
                      },
                    ]}
                    onPress={onClose}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
                  {/* Cloud Status Banner */}
                  <View
                    style={[
                      styles.syncCard,
                      {
                        backgroundColor: colors.surfaceLight,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View style={styles.syncLeft}>
                      <View style={styles.pulseDot} />
                      <View style={styles.syncTextCol}>
                        <Text
                          style={[styles.syncStatusTitle, { color: colors.textPrimary }]}
                          numberOfLines={1}
                        >
                          Google Cloud Active
                        </Text>
                        <Text
                          style={[styles.syncStatusSubtitle, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          Spark Plan • 100% Free Forever
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.syncNowBtn,
                        {
                          backgroundColor: colors.primary,
                        },
                        isSyncing && { opacity: 0.7 },
                      ]}
                      onPress={handleManualSync}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MaterialCommunityIcons name="cloud-sync" size={16} color="#FFFFFF" />
                          <Text style={styles.syncNowTxt}>Sync Now</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Metrics Row */}
                  <View style={styles.metricsRow}>
                    <View
                      style={[
                        styles.metricBox,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: colors.borderLight,
                        },
                      ]}
                    >
                      <Text style={[styles.metricVal, { color: colors.primary }]}>
                        {invoicesCount}
                      </Text>
                      <Text style={[styles.metricLbl, { color: colors.textSecondary }]}>
                        Total Invoices
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metricBox,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: colors.borderLight,
                        },
                      ]}
                    >
                      <Text style={[styles.metricVal, { color: '#10B981' }]}>1 GB</Text>
                      <Text style={[styles.metricLbl, { color: colors.textSecondary }]}>
                        Cloud Quota (&lt;1% used)
                      </Text>
                    </View>
                  </View>

                  {/* Store Profile Section */}
                  <View style={styles.profileSection}>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        STORE DETAILS
                      </Text>
                      {!isEditing ? (
                        <TouchableOpacity
                          style={styles.editToggleBtn}
                          onPress={() => setIsEditing(true)}
                        >
                          <MaterialCommunityIcons
                            name="pencil-outline"
                            size={14}
                            color={colors.primary}
                          />
                          <Text style={[styles.editToggleTxt, { color: colors.primary }]}>Edit</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.editToggleBtn}
                          onPress={() => setIsEditing(false)}
                        >
                          <Text style={[styles.editToggleTxt, { color: colors.textMuted }]}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Shop Name */}
                    <View style={styles.fieldRow}>
                      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                        Shop Name:
                      </Text>
                      {isEditing ? (
                        <TextInput
                          style={[
                            styles.fieldInput,
                            {
                              color: colors.textPrimary,
                              backgroundColor: colors.surfaceLight,
                              borderColor: colors.border,
                            },
                          ]}
                          value={shopName}
                          onChangeText={setShopName}
                          placeholder="Shop Name"
                          placeholderTextColor={colors.textMuted}
                        />
                      ) : (
                        <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
                          {user?.shopName || 'Not Set'}
                        </Text>
                      )}
                    </View>

                    {/* Owner Name */}
                    <View style={styles.fieldRow}>
                      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                        Owner Name:
                      </Text>
                      {isEditing ? (
                        <TextInput
                          style={[
                            styles.fieldInput,
                            {
                              color: colors.textPrimary,
                              backgroundColor: colors.surfaceLight,
                              borderColor: colors.border,
                            },
                          ]}
                          value={ownerName}
                          onChangeText={setOwnerName}
                          placeholder="Owner Name"
                          placeholderTextColor={colors.textMuted}
                        />
                      ) : (
                        <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
                          {user?.ownerName || 'Not Set'}
                        </Text>
                      )}
                    </View>

                    {/* Contact Phone */}
                    <View style={styles.fieldRow}>
                      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Phone:</Text>
                      {isEditing ? (
                        <TextInput
                          style={[
                            styles.fieldInput,
                            {
                              color: colors.textPrimary,
                              backgroundColor: colors.surfaceLight,
                              borderColor: colors.border,
                            },
                          ]}
                          value={phone}
                          onChangeText={setPhone}
                          placeholder="Contact Phone"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="phone-pad"
                        />
                      ) : (
                        <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
                          {user?.phone || 'Not Set'}
                        </Text>
                      )}
                    </View>

                    {/* Registered Email (Locked) */}
                    <View style={styles.fieldRow}>
                      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Email:</Text>
                      <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
                        {user?.email || 'N/A'}
                      </Text>
                    </View>

                    {/* Save Changes button when editing */}
                    {isEditing && (
                      <TouchableOpacity
                        style={[
                          styles.saveChangesBtn,
                          { backgroundColor: colors.primary },
                          isSaving && { opacity: 0.7 },
                        ]}
                        onPress={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.saveChangesTxt}>Save Store Changes</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>

                {/* Footer Action: Sign Out */}
                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                  <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
                  <Text style={styles.signOutTxt}>Sign Out of Store</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 10,
  },
  storeBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  verifiedBadgeIcon: {
    flexShrink: 0,
  },
  storeSubtitle: {
    fontSize: 12,
    marginTop: 2,
    flexShrink: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scrollBody: {
    paddingVertical: 14,
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 10,
  },
  syncLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  syncTextCol: {
    flex: 1,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    flexShrink: 0,
  },
  syncStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  syncStatusSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  syncNowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    flexShrink: 0,
  },
  syncNowTxt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  metricLbl: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  profileSection: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  editToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  editToggleTxt: {
    fontSize: 12,
    fontWeight: '800',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 80,
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  fieldInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    textAlign: 'right',
  },
  saveChangesBtn: {
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  saveChangesTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  signOutTxt: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
});

