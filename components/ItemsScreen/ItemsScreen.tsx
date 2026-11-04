/**
 * components/ItemsScreen/ItemsScreen.tsx
 * 
 * POS Catalog & Product Management Screen for FlashBill.
 * Symmetrical in design, styling, and layout to InvoicesScreen.
 * 
 * Features:
 * - Header with total products count, average price, and "Add Product" CTA
 * - Real-time search across product name, category, and unit
 * - Horizontal filter chips with live counts:
 *   - All Products
 *   - Price Drops (▼ Savings)
 *   - Price Rises (▲ Increases)
 *   - With Discount (🏷️)
 *   - Dynamic Category chips (Rice, Dal, Oil, Spices, etc.)
 * - Symmetrical Item Cards featuring:
 *   - Category badge & Unit pill
 *   - Product Name & Previous price subtitle: "Was ₹XX.XX • Price updated"
 *   - Previous Price delta indicator: "▲ +10.0%" or "▼ -12.5%"
 *   - Prominent Selling Rate: "₹ XX.XX /UNIT"
 *   - Symmetrical Edit & Delete action buttons
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
    const lowStock = items.filter((it) => it.stockQuantity !== undefined && it.stockQuantity <= 10).length;

    const baseFilters = [
      { id: 'ALL', label: 'All Items', icon: 'package-variant', count: all },
      { id: 'LOW_STOCK', label: 'Low Stock', icon: 'alert-circle-outline', color: '#F59E0B', count: lowStock },
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
      if (activeFilter === 'LOW_STOCK') {
        if (it.stockQuantity === undefined || it.stockQuantity > 10) return false;
      } else if (activeFilter === 'PRICE_DOWN') {
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
      const purchasePrice = (it.purchasePrice || '').toLowerCase();

      return (
        name.includes(q) ||
        cat.includes(q) ||
        unit.includes(q) ||
        price.includes(q) ||
        purchasePrice.includes(q)
      );
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
          <Text style={styles.addItemHeaderTxt}>Add Product</Text>
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

          // Profit margin calculations
          const costP = parseFloat(item.purchasePrice || '0') || 0;
          const hasMargin = currP > 0 && costP > 0;
          const marginDiff = (currP - costP).toFixed(2).replace(/\.00$/, '');
          const isMarginPos = currP >= costP;
          const marginPct = costP > 0 ? Math.abs(((currP - costP) / costP) * 100).toFixed(0) : '0';

          // Stock state
          const stock = item.stockQuantity;
          const hasStock = typeof stock === 'number';
          const isOutOfStock = typeof stock === 'number' && stock <= 0;
          const isLowStock = typeof stock === 'number' && stock > 0 && stock <= 10;

          return (
            <TouchableOpacity
              style={[
                styles.itemCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isOutOfStock
                    ? (isDark ? 'rgba(239, 68, 68, 0.4)' : '#FCA5A5')
                    : colors.border,
                },
              ]}
              onPress={() => handleOpenEdit(item)}
              activeOpacity={0.7}
            >
              {/* Top Section: Product Name on Left, Trend & Stock Badges on Right */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.nameContainer}>
                  <Text style={[styles.itemNameTxt, { color: colors.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemSubDetail, { color: colors.textSecondary }]}>
                    {`Unit: ${item.unit}`}
                  </Text>
                </View>

                {/* Right Status Badges: Price Drop/Gain & In-Stock */}
                <View style={styles.headerBadgesRight}>
                  {/* Price Trend Badge (Drop or Gain) */}
                  {hasPriceTrend && (
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
                        {isUp ? `▲ +${pct}%` : `▼ -${pct}%`}
                      </Text>
                    </View>
                  )}

                  {/* In-Stock Quantity Badge */}
                  {hasStock && (
                    <View
                      style={[
                        styles.stockBadge,
                        {
                          backgroundColor: isOutOfStock
                            ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2')
                            : isLowStock
                            ? (isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7')
                            : (isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7'),
                          borderColor: isOutOfStock
                            ? '#EF4444'
                            : isLowStock
                            ? '#F59E0B'
                            : '#10B981',
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={isOutOfStock ? 'alert-circle-outline' : 'package-variant-closed'}
                        size={11}
                        color={isOutOfStock ? '#EF4444' : isLowStock ? '#D97706' : '#10B981'}
                      />
                      <Text
                        style={[
                          styles.stockBadgeTxt,
                          {
                            color: isOutOfStock ? '#EF4444' : isLowStock ? '#D97706' : '#10B981',
                          },
                        ]}
                      >
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low: ${stock}` : `Stock: ${stock}`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Bottom Row: Dual Pricing Row (Sale Price + Purchase Price on Left, Delete on Right) */}
              <View style={[styles.cardBottomRow, { borderTopColor: colors.borderLight }]}>
                {/* Dual Price Columns */}
                <View style={styles.dualPriceContainer}>
                  {/* 1. Sale Price (Prominent) */}
                  <View style={styles.priceColumn}>
                    <Text style={[styles.rateLbl, { color: colors.primary }]}>
                      Sale Price
                    </Text>
                    <View style={styles.rateValueRow}>
                      <Text style={[styles.rateCurrency, { color: colors.primary }]}>₹</Text>
                      <Text style={[styles.rateAmount, { color: colors.primary }]}>
                        {item.price}
                      </Text>
                      <Text style={[styles.perUnitTxt, { color: colors.textMuted }]}>
                        /{item.unit}
                      </Text>
                    </View>
                  </View>

                  {/* Vertical Separator */}
                  <View style={[styles.priceSeparator, { backgroundColor: colors.borderLight }]} />

                  {/* 2. Purchase Price (Cost) */}
                  <View style={styles.priceColumn}>
                    <Text style={[styles.rateLbl, { color: colors.textSecondary }]}>
                      Purchase (Cost)
                    </Text>
                    <View style={styles.rateValueRow}>
                      <Text style={[styles.costCurrency, { color: colors.textSecondary }]}>₹</Text>
                      <Text style={[styles.costAmount, { color: colors.textPrimary }]}>
                        {item.purchasePrice || '—'}
                      </Text>
                      {item.purchasePrice ? (
                        <Text style={[styles.perUnitTxt, { color: colors.textMuted }]}>
                          /{item.unit}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                {/* Right: Quick Delete Button (Edit button removed as card is tap-to-edit) */}
                <TouchableOpacity
                  style={[
                    styles.deleteBtn,
                    {
                      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                      borderColor: isDark ? '#EF4444' : '#FECACA',
                    },
                  ]}
                  onPress={() => handleDeleteConfirm(item)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={16}
                    color={colors.error}
                  />
                </TouchableOpacity>
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
    gap: 6,
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
    paddingBottom: 28,
    gap: 12,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 112,
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 46,
    gap: 8,
  },
  nameContainer: {
    flex: 1,
    paddingRight: 4,
    minHeight: 46,
    justifyContent: 'flex-start',
  },
  headerBadgesRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: '44%',
  },
  itemNameTxt: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 17,
  },
  itemSubDetail: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    gap: 3,
  },
  stockBadgeTxt: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  trendBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  trendBadgeTxt: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 6,
  },
  dualPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 6,
  },
  priceColumn: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  priceSeparator: {
    width: 1,
    height: 22,
  },
  rateLbl: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rateValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  rateCurrency: {
    fontSize: 11,
    fontWeight: '700',
    marginRight: 1,
  },
  rateAmount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  costCurrency: {
    fontSize: 10.5,
    fontWeight: '600',
    marginRight: 1,
  },
  costAmount: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  perUnitTxt: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  emptyCreateBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyCreateTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
