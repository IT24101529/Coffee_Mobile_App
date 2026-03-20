import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { apiClient } from '@/src/config/api';
import { useAuth } from '@/src/context/AuthContext';
import { formatDate, getImageUrl } from '@/src/utils/formatters';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { StatusBadge } from '@/src/components/StatusBadge';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/src/config/colors';

interface Order {
  _id: string;
  productId: { _id: string; name: string; price: number; image?: string };
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

const STATUS_ORDER = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isAdmin } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load order';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/orders/${orderId}`);
              Alert.alert('Success', 'Order cancelled');
              router.push('/(tabs)/orders');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (!order) return;

    Alert.alert('Update Status', `Change status to ${newStatus}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            setUpdatingStatus(true);
            await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
            setOrder({ ...order, status: newStatus as any });
            Alert.alert('Success', 'Status updated');
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
          } finally {
            setUpdatingStatus(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error || 'Order not found'} onRetry={fetchOrder} />
      </View>
    );
  }

  const nextStatuses = STATUS_ORDER.slice(
    STATUS_ORDER.indexOf(order.status) + 1,
    STATUS_ORDER.indexOf(order.status) + 2
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Image
            source={
              order.productId.image
                ? { uri: getImageUrl(order.productId.image) }
                : require('@/assets/images/icon.png')
            }
            style={styles.image}
            resizeMode="cover"
          />

          <Text style={styles.productName}>{order.productId.name}</Text>

          <Text style={styles.divider}>──────────────────────────</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.value}>{order.quantity}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Unit Price:</Text>
            <Text style={styles.value}>Rs. {order.productId.price}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Total:</Text>
            <Text style={[styles.value, styles.totalPrice]}>Rs. {order.totalPrice}</Text>
          </View>

          <Text style={styles.divider}>──────────────────────────</Text>

          <View style={styles.statusSection}>
            <Text style={styles.label}>Status:</Text>
            <StatusBadge status={order.status} />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Ordered:</Text>
            <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
          </View>

          {order.notes && (
            <>
              <Text style={styles.divider}>──────────────────────────</Text>
              <View>
                <Text style={styles.label}>Notes:</Text>
                <Text style={styles.notes}>{order.notes}</Text>
              </View>
            </>
          )}

          {isAdmin && nextStatuses.length > 0 && (
            <>
              <Text style={styles.divider}>──────────────────────────</Text>
              <View>
                <Text style={styles.adminLabel}>Update Status:</Text>
                {nextStatuses.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={styles.statusButton}
                    onPress={() => handleStatusUpdate(status)}
                    disabled={updatingStatus}
                  >
                    <Text style={styles.statusButtonText}>→ Move to {status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {order.status === 'Pending' && (
            <>
              <Text style={styles.divider}>──────────────────────────</Text>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  productName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  divider: {
    color: COLORS.border,
    marginVertical: SPACING.md,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  value: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  totalPrice: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONT_SIZES.lg,
  },
  statusSection: {
    marginBottom: SPACING.md,
  },
  notes: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  adminLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  statusButton: {
    backgroundColor: COLORS.card,
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 4,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statusButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
