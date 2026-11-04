/**
 * components/ItemsScreen/ItemsScreen.tsx
 * 
 * POS Catalog & Product Management Screen for FlashBill.
 * Symmetrical in design, styling, and layout to InvoicesScreen.
 * 
 * Features:
 * - Header with total products count, average price, and "+ Add Item" CTA
 * - Real-time search across product name, category, and unit
 * - Horizontal filter chips with live counts:
 *   - All Products
 *   - Price Drops (▼ Savings)
 *   - Price Rises (▲ Increases)
 *   - With Discount (🏷️)
 *   - Category chips (Rice, Dal, Oil, Spices, etc.)
 * - Symmetrical Item Cards featuring:
 *   - Category badge & Unit pill
 *   - Product Name & Default Discount badge
 *   - Previous Price delta indicator: "Was ₹XX.XX [ ▲/▼ XX% ]"
 *   - Current Selling Rate (₹)
 *   - 1-Tap Edit & Delete actions
 * - Pull-to-refresh & full dark/light theme support
 */

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { PresetItem } from '../../types/item';
import { ItemEditModal } from './ItemEditModal';

interface ItemsScreenProps {
  items: PresetItem[];
  onSaveItem: (item: PresetItem) => void;
  onDeleteItem: (itemId: string) => void;
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
}

export function ItemsScreen({
  items,
  onSaveItem,
  onDeleteItem,
  onRefresh,
  isRefreshing,
}: ItemsScreenProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  // Search input state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active filter chip state
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modal state for Add / Edit
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<PresetItem | null>(null);

  // Extract unique categories from items list for filter chips
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((it) => {
      if (it.category && it.category.trim()) {
        cats.add(it.category.trim());
      }
    });
    return Array.from(cats);
  }, [items]);

  // Filter chips configuration with live counts
  const filterOptions = useMemo(() => {
    const all = items.length;
    const priceDrops = items.filter((it) => {
      if (!it.previousPrice) return false;
      return (parseFloat(it.price) || 0) < (parseFloat(it.previousPrice) || 0);
    }).length;

    const priceUp = items.filter((it) => {
      if (!it.previousPrice) return false;
      return (parseFloat(it.price) || 0) > (parseFloat(it.previousPrice) || 0);
    }).length;

    const withDisc = items.filter((it) => (parseFloat(it.defaultDiscount || '0') || 0) > 0).length;

    const baseFilters = [
      { id: 'ALL', label: 'All Items', icon: 'package-variant', count: all },
      { id: 'PRICE_DOWN', label: 'Price Drops', icon: 'trending-down', color: '#10B981', count: priceDrops },
      { id: 'PRICE_UP', label: 'Price Up', icon: 'trending-up', color: '#EF4444', count: priceUp },
      { id: 'DISCOUNT', label: 'With Disc', icon: 'tag-outline', color: '#8B5CF6', count: withDisc },
    ];

    const categoryFilters = dynamicCategories.map((cat) => ({
      id: `CAT_${cat}`,
      label: cat,
      icon: 'shape-outline',
      color: colors.primary,
      count: items.filter((it) => it.category === cat).length,
    }));

    return [...baseFilters, ...categoryFilters];
  }, [items, dynamicCategories, colors.primary]);

  // Filter items based on active chip and search query
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      // 1. Filter Chip Matching
      if (activeFilter === 'PRICE_DOWN') {
        if (!it.previousPrice) return false;
        if ((parseFloat(it.price) || 0) >= (parseFloat(it.previousPrice) || 0)) return false;
      } else if (activeFilter === 'PRICE_UP') {
        if (!it.previousPrice) return false;
        if ((parseFloat(it.price) || 0) <= (parseFloat(it.previousPrice) || 0)) return false;
      } else if (activeFilter === 'DISCOUNT') {
        if ((parseFloat(it.defaultDiscount || '0') || 0) <= 0) return false;
      } else if (activeFilter.startsWith('CAT_')) {
        const targetCat = activeFilter.replace('CAT_', '');
        if (it.category !== targetCat) return false;
      }

      // 2. Search Query Matching
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const name = (it.name || '').toLowerCase();
      const cat = (it.category || '').toLowerCase();
      const unit = (it.unit || '').toLowerCase();
      const price = (it.price || '').toLowerCase();

      return name.includes(q) || cat.includes(q) || unit.includes(q) || price.includes(q);
    });
  }, [items, activeFilter, searchQuery]);

  // Aggregate metrics
  const avgPrice = useMemo(() => {
    if (items.length === 0) return '0.00';
    const sum = items.reduce((acc, it) => acc + (parseFloat(it.price) || 0), 0);
    return (sum / items.length).toFixed(2).replace(/\.00$/, '');
  }, [items]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setShowEditModal(true);
  };

  const handleOpenEdit = (it: PresetItem) => {
    setSelectedItem(it);
    setShowEditModal(true);
  };

  const handleDeleteConfirm = (it: PresetItem) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to remove "${it.name}" from your catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteItem(it.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Header & Summary Strip (Symmetrical to InvoicesScreen) */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Items & Catalog
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {items.length} Products • Avg Price: ₹{avgPrice}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addItemHeaderBtn, { backgroundColor: colors.primary }]}
          onPress={handleOpenAdd}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
          <Text style={styles.addItemHeaderTxt}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Real-Time Search Bar */}
      <View
        style={[
          styles.searchWrapper,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderLight,
          },
        ]}
      >
        <MaterialCommunityIcons name="magnify" size={22} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search product, category, unit, or price..."
          placeholderTextColor={colors.textMuted}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 2B. Horizontal Filter Chips */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filterOptions.map((filter) => {
            const isSelected = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDark
                      ? colors.surface
                      : '#FFFFFF',
                    borderColor: isSelected
                      ? colors.primary
                      : isDark
                      ? colors.border
                      : colors.borderLight,
                  },
                ]}
                onPress={() => setActiveFilter(filter.id)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={filter.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : filter.color || colors.textSecondary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.filterChipLabel,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {filter.label}
                </Text>
                <View
                  style={[
                    styles.filterCountBadge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255, 255, 255, 0.25)'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : '#F1F5F9',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountTxt,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant" size={56} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {searchQuery ? 'No Products Matched' : 'Catalog is Empty'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery
                ? `No products matching "${searchQuery}". Try another keyword.`
                : 'Add your store products to enable rapid 1-tap auto-suggestions during sale billing.'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={[styles.emptyCreateBtn, { backgroundColor: colors.primary }]}
                onPress={handleOpenAdd}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyCreateTxt}>+ Add First Product</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => {
          // Calculate historical price delta
          const oldP = parseFloat(item.previousPrice || '0') || 0;
          const currP = parseFloat(item.price || '0') || 0;
          const hasPriceTrend = oldP > 0 && currP > 0 && oldP !== currP;
          const diff = currP - oldP;
          const isUp = diff > 0;
          const pct = Math.abs((diff / oldP) * 100).toFixed(1);

          return (
            <TouchableOpacity
              style={[
                styles.itemCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleOpenEdit(item)}
              activeOpacity={0.7}
            >
              {/* Row 1: Category Badge, Unit, Actions */}
              <View style={styles.cardTopRow}>
                <View style={styles.badgesRow}>
                  {/* Category Pill */}
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text style={[styles.categoryBadgeTxt, { color: colors.primary }]}>
                      {item.category || 'General'}
                    </Text>
                  </View>

                  {/* Unit Pill */}
                  <View
                    style={[
                      styles.unitBadge,
                      {
                        backgroundColor: colors.surfaceLight,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <Text style={[styles.unitBadgeTxt, { color: colors.textSecondary }]}>
                      {item.unit}
                    </Text>
                  </View>

                  {/* Preset Discount Pill (if configured) */}
                  {item.defaultDiscount && parseFloat(item.defaultDiscount) > 0 ? (
                    <View
                      style={[
                        styles.discountBadge,
                        {
                          backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#F3E8FF',
                          borderColor: '#8B5CF6',
                        },
                      ]}
                    >
                      <Text style={[styles.discountBadgeTxt, { color: '#8B5CF6' }]}>
                        🏷️ {item.defaultDiscount}% Disc
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Edit & Delete Action Icons */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => handleOpenEdit(item)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => handleDeleteConfirm(item)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 2: Product Name */}
              <Text
                style={[styles.itemNameTxt, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              {/* Row 3: Price & Trend Footer */}
              <View style={[styles.cardBottomRow, { borderTopColor: colors.borderLight }]}>
                {/* Left: Previous Price Trend or Subtitle */}
                <View style={styles.priceTrendLeft}>
                  {hasPriceTrend ? (
                    <View style={styles.trendInlineRow}>
                      <Text style={[styles.wasPriceTxt, { color: colors.textMuted }]}>
                        Was ₹{oldP.toFixed(2).replace(/\.00$/, '')}
                      </Text>
                      <View
                        style={[
                          styles.trendBadge,
                          {
                            backgroundColor: isUp
                              ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2')
                              : (isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7'),
                            borderColor: isUp ? '#EF4444' : '#10B981',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.trendBadgeTxt,
                            { color: isUp ? '#EF4444' : '#10B981' },
                          ]}
                        >
                          {isUp ? `▲ (+${pct}%)` : `▼ (-${pct}%)`}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={[styles.standardRateSubtitle, { color: colors.textMuted }]}>
                      Standard Catalog Rate
                    </Text>
                  )}
                </View>

                {/* Right: Current Rate */}
                <View style={styles.priceColRight}>
                  <Text style={[styles.currencyPrefix, { color: colors.primary }]}>₹</Text>
                  <Text style={[styles.priceTxt, { color: colors.primary }]}>
                    {item.price}
                  </Text>
                  <Text style={[styles.perUnitTxt, { color: colors.textMuted }]}>
                    /{item.unit}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Add / Edit Product Modal */}
      <ItemEditModal
        visible={showEditModal}
        item={selectedItem}
        onClose={() => setShowEditModal(false)}
        onSave={onSaveItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  addItemHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  addItemHeaderTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  filterScrollWrapper: {
    marginBottom: 12,
  },
  filterScrollContent: {
    paddingRight: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipLabel: {
    fontSize: 12,
    marginRight: 6,
  },
  filterCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  filterCountTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryBadgeTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  unitBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  unitBadgeTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  discountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  discountBadgeTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    padding: 4,
  },
  itemNameTxt: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  priceTrendLeft: {
    flex: 1,
  },
  trendInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wasPriceTxt: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  trendBadgeTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  standardRateSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  priceColRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 1,
  },
  priceTxt: {
    fontSize: 18,
    fontWeight: '900',
  },
  perUnitTxt: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  emptyCreateBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyCreateTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

