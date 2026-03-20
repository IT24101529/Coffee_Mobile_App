import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/src/config/colors';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showLabel?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 20,
  interactive = false,
  onRatingChange,
  showLabel = false,
}) => {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <View>
      <View style={styles.container}>
        {stars.map((star) => {
          const isFilled = star <= Math.round(rating);
          return (
            <TouchableOpacity
              key={star}
              disabled={!interactive}
              onPress={() => interactive && onRatingChange?.(star)}
              style={styles.starButton}
            >
              <Star
                size={size}
                color={isFilled ? COLORS.secondary : '#555555'}
                fill={isFilled ? COLORS.secondary : 'transparent'}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      {showLabel && (
        <Text style={styles.label}>{rating.toFixed(1)} out of {maxStars}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  starButton: {
    padding: SPACING.xs,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
