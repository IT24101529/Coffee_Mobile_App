import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiClient } from '@/src/config/api';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { EmptyState } from '@/src/components/EmptyState';
import { OrderCard } from '@/src/components/OrderCard';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/src/config/colors';

interface Order {
  _id: string;
  productId: { name: string; image?: string };
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

const STATUSES = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/orders');
      setOrders(response.data);
      filterOrders(response.data, selectedStatus);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (allOrders: Order[], status: string) => {
    if (status === 'All') {
      setFilteredOrders(allOrders);
    } else {
      setFilteredOrders(allOrders.filter((o) => o.status === status));
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  useEffect(() => {
    filterOrders(orders, selectedStatus);
  }, [selectedStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="coffee-outline"
          title="No Orders Yet"
          subtitle="Browse the menu to place your first order!"
          actionLabel="Go to Menu"
          onAction={() => router.push('/(tabs)/menu')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={STATUSES}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedStatus === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedStatus(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedStatus === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        />
      </View>

      {error && <ErrorMessage message={error} onRetry={fetchOrders} />}

      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => (
          <OrderCard
            orderId={item._id}
            productName={item.productId.name}
            productImage={item.productId.image}
            quantity={item.quantity}
            totalPrice={item.totalPrice}
            status={item.status}
            createdAt={item.createdAt}
            onPress={() => router.push(`/(tabs)/orders/${item._id}`)}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
});
