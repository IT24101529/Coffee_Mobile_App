import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { formatDate, getImageUrl } from '@/src/utils/formatters';
import { StatusBadge } from './StatusBadge';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/src/config/colors';

interface OrderCardProps {
  orderId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
  onPress: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  productName,
  productImage,
  quantity,
  totalPrice,
  status,
  createdAt,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <Image
          source={productImage ? { uri: getImageUrl(productImage) } : require('@/assets/images/icon.png')}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.details}>
          <Text style={styles.productName} numberOfLines={1}>
            {productName}
          </Text>
          <Text style={styles.quantity}>Qty: {quantity}</Text>
          <Text style={styles.total}>Rs. {totalPrice}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <StatusBadge status={status} />
        <Text style={styles.date}>{formatDate(createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  quantity: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  total: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
