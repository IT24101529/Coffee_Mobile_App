import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '@/src/config/api';
import { useAuth } from '@/src/context/AuthContext';
import { getImageUrl } from '@/src/utils/formatters';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/src/config/colors';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  caffeine: string;
  image?: string;
  available: boolean;
}

const CATEGORIES = ['Hot', 'Cold', 'Specialty', 'Non-Coffee'];
const CAFFEINE_LEVELS = ['None', 'Low', 'Medium', 'High'];

export default function ManageProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isAdmin } = useAuth();
  const productId = params.id as string | undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Hot');
  const [caffeine, setCaffeine] = useState('Medium');
  const [available, setAvailable] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Only admins can access this screen');
      router.back();
      return;
    }

    if (productId) {
      fetchProduct();
    }
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/products/${productId}`);
      const prod = response.data;
      setProduct(prod);
      setName(prod.name);
      setDescription(prod.description);
      setPrice(prod.price.toString());
      setCategory(prod.category);
      setCaffeine(prod.caffeine);
      setAvailable(prod.available);
      if (prod.image) {
        setImagePreview(getImageUrl(prod.image));
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load product';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setImagePreview(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!name.trim() || name.length < 3) {
      setError('Product name must be at least 3 characters');
      return false;
    }
    if (!description.trim() || description.length < 10) {
      setError('Description must be at least 10 characters');
      return false;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 1) {
      setError('Price must be a valid number greater than 0');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError(null);
    if (!validateForm()) return;

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('caffeine', caffeine);
      formData.append('available', available ? 'true' : 'false');

      if (imageUri && !imageUri.startsWith('http')) {
        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg';
        formData.append('image', {
          uri: imageUri,
          name: `product.${fileType}`,
          type: mimeType,
        } as any);
      }

      if (productId) {
        await apiClient.put(`/products/${productId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await apiClient.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      Alert.alert('Success', productId ? 'Product updated!' : 'Product created!');
      router.back();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save product';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productId) return;

    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/products/${productId}`);
            Alert.alert('Success', 'Product deleted!');
            router.back();
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete product');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{productId ? 'Edit Product' : 'Add Product'}</Text>
          <View style={{ width: 24 }} />
        </View>

        {error && <ErrorMessage message={error} />}

        <View style={styles.content}>
          <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
            {imagePreview ? (
              <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.uploadText}>Tap to upload image</Text>
            )}
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Caramel Macchiato"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the product..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (Rs.)</Text>
              <TextInput
                style={styles.input}
                placeholder="450"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.pickerButton,
                      category === cat && styles.pickerButtonActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        category === cat && styles.pickerButtonTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Caffeine Level</Text>
              <View style={styles.pickerContainer}>
                {CAFFEINE_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.pickerButton,
                      caffeine === level && styles.pickerButtonActive,
                    ]}
                    onPress={() => setCaffeine(level)}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        caffeine === level && styles.pickerButtonTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.label}>Available</Text>
              <Switch
                value={available}
                onValueChange={setAvailable}
                trackColor={{ false: COLORS.card, true: COLORS.primary }}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : productId ? 'Update Product' : 'Save Product'}
              </Text>
            </TouchableOpacity>

            {productId && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={saving}
              >
                <Text style={styles.deleteButtonText}>Delete Product</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  imageUpload: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.lg,
  },
  uploadText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  pickerButton: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  pickerButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pickerButtonText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  pickerButtonTextActive: {
    color: COLORS.white,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});
