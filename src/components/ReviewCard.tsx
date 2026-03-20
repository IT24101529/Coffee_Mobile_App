import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StarRating } from './StarRating';
import { formatDate } from '@/src/utils/formatters';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/src/config/colors';

interface ReviewCardProps {
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  userName,
  rating,
  comment,
  createdAt,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.date}>{formatDate(createdAt)}</Text>
      </View>
      <StarRating rating={rating} size={16} />
      <Text style={styles.comment}>{comment}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  comment: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    lineHeight: 20,
  },
});
