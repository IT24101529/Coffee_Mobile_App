import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { apiClient } from '@/src/config/api';
import { useAuth } from '@/src/context/AuthContext';
import { getGreeting } from '@/src/utils/formatters';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { ProductCard } from '@/src/components/ProductCard';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/src/config/colors';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes] = await Promise.all([
        apiClient.get('/products'),
      ]);

      const allProducts = productsRes.data.filter((p: Product) => p && p._id);
      setProducts(allProducts.slice(0, 4));
      setTrendingProducts(allProducts.slice(0, 5));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load products';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, {user?.name}! ☕</Text>
        <Text style={styles.subheading}>Find your perfect coffee today</Text>
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push('/(tabs)/menu')}
      >
        <Search size={20} color={COLORS.textMuted} />
        <Text style={styles.searchText}>Search coffee...</Text>
      </TouchableOpacity>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {trendingProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
          <FlatList
            data={trendingProducts}
            renderItem={({ item }) => (
              <View style={styles.trendingCard}>
                <ProductCard
                  id={item._id}
                  name={item.name}
                  price={item.price}
                  image={item.image}
                  category={item.category}
                  onPress={() => router.push(`/(tabs)/menu/${item._id}`)}
                />
              </View>
            )}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
          />
        </View>
      )}

      {products.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <View style={styles.grid}>
            {products.map((product) => (
              <View key={product._id} style={styles.gridItem}>
                <ProductCard
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  category={product.category}
                  onPress={() => router.push(`/(tabs)/menu/${product._id}`)}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.spacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  subheading: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  searchBar: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  searchText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
  },
  section: {
    paddingBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  trendingCard: {
    width: 200,
    marginHorizontal: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 0.8,
  },
  spacing: {
    height: SPACING.xl,
  },
});
