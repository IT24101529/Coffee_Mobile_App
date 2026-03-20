import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, CreditCard as Edit3 } from 'lucide-react-native';
import { apiClient } from '@/src/config/api';
import { useAuth } from '@/src/context/AuthContext';
import { getImageUrl } from '@/src/utils/formatters';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { StarRating } from '@/src/components/StarRating';
import { ReviewCard } from '@/src/components/ReviewCard';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/src/config/colors';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  caffeine: string;
  image?: string;
}

interface Review {
  _id: string;
  userId: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewStats {
  reviews: Review[];
  avgRating: string;
  total: number;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, isAdmin } = useAuth();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productRes, reviewsRes] = await Promise.all([
        apiClient.get(`/products/${productId}`),
        apiClient.get(`/reviews/product/${productId}`),
      ]);

      setProduct(productRes.data);
      setReviews(reviewsRes.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load product';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!product || quantity < 1) return;

    try {
      setOrderLoading(true);
      const totalPrice = product.price * quantity;
      await apiClient.post('/orders', {
        productId: product._id,
        quantity: parseInt(quantity.toString()),
        totalPrice,
        notes: notes || undefined,
      });

      setOrderModalVisible(false);
      setQuantity(1);
      setNotes('');
      Alert.alert('Success', 'Order placed successfully!');
      router.push('/(tabs)/orders');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0 || comment.length < 10) {
      Alert.alert('Validation', 'Please rate and comment (minimum 10 characters)');
      return;
    }

    try {
      setReviewLoading(true);
      await apiClient.post('/reviews', {
        productId: product?._id,
        rating,
        comment,
      });

      setReviewModalVisible(false);
      setRating(0);
      setComment('');
      Alert.alert('Success', 'Review submitted!');
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error || 'Product not found'} onRetry={fetchData} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity onPress={() => router.push(`/(tabs)/menu/manage?id=${product._id}`)}>
              <Edit3 size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        <Image
          source={product.image ? { uri: getImageUrl(product.image) } : require('@/assets/images/icon.png')}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.category}</Text>
            </View>
            <View style={[styles.badge, styles.caffeineBadge]}>
              <Text style={styles.badgeText}>{product.caffeine}</Text>
            </View>
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>Rs. {product.price}</Text>

          <Text style={styles.divider}>─────────────────────────</Text>

          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.divider}>─────────────────────────</Text>

          <TouchableOpacity style={styles.orderButton} onPress={() => setOrderModalVisible(true)}>
            <Text style={styles.orderButtonText}>ORDER NOW</Text>
          </TouchableOpacity>

          <Text style={styles.divider}>─────────────────────────</Text>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingText}>
              ★ {reviews?.avgRating || 'N/A'} ({reviews?.total || 0} reviews)
            </Text>
            {user && (
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => setReviewModalVisible(true)}
              >
                <Text style={styles.writeReviewText}>Write a Review</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.divider}>─────────────────────────</Text>

          {reviews && reviews.reviews.length > 0 ? (
            <View>
              <FlatList
                data={reviews.reviews}
                renderItem={({ item }) => (
                  <ReviewCard
                    userName={item.userId.name}
                    rating={item.rating}
                    comment={item.comment}
                    createdAt={item.createdAt}
                  />
                )}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <Text style={styles.noReviews}>No reviews yet</Text>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={orderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOrderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order: {product.name}</Text>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add special notes (optional)"
              placeholderTextColor={COLORS.textMuted}
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <Text style={styles.totalPrice}>Total: Rs. {product.price * quantity}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setOrderModalVisible(false)}
                disabled={orderLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.placeOrderButton}
                onPress={handlePlaceOrder}
                disabled={orderLoading}
              >
                <Text style={styles.placeOrderButtonText}>
                  {orderLoading ? 'Placing...' : 'Place Order'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>

            <Text style={styles.ratingLabel}>How would you rate this?</Text>
            <View style={styles.starsContainer}>
              <StarRating
                rating={rating}
                maxStars={5}
                size={32}
                interactive
                onRatingChange={setRating}
              />
            </View>

            <TextInput
              style={[styles.notesInput, styles.commentInput]}
              placeholder="Share your thoughts (minimum 10 characters)"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setReviewModalVisible(false)}
                disabled={reviewLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.placeOrderButton}
                onPress={handleSubmitReview}
                disabled={reviewLoading}
              >
                <Text style={styles.placeOrderButtonText}>
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  badges: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  caffeineBadge: {
    backgroundColor: COLORS.secondary,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  name: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  divider: {
    color: COLORS.border,
    marginVertical: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  orderButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  orderButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  ratingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  writeReviewButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
  },
  writeReviewText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  noReviews: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  quantityButton: {
    backgroundColor: COLORS.card,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  quantityButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  quantityText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    minHeight: 80,
  },
  commentInput: {
    minHeight: 100,
  },
  totalPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeOrderButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  placeOrderButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  ratingLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  starsContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
});
