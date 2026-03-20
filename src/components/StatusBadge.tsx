import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/src/config/colors';

interface StatusBadgeProps {
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'accepted' | 'rejected' | 'pending';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'Pending':
      case 'pending':
        return { backgroundColor: COLORS.warning };
      case 'Confirmed':
        return { backgroundColor: '#2E75B6' };
      case 'Completed':
      case 'accepted':
        return { backgroundColor: COLORS.success };
      case 'Cancelled':
      case 'rejected':
        return { backgroundColor: COLORS.error };
      default:
        return { backgroundColor: COLORS.textMuted };
    }
  };

  return (
    <View style={[styles.badge, getStatusStyle()]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  text: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
});
