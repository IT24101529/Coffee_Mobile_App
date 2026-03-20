import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { COLORS } from '@/src/config/colors';

export default function Index() {
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, user]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LoadingSpinner fullScreen />
    </View>
  );
}