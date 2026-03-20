import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { View } from 'react-native';
import { COLORS } from '@/src/config/colors';

export const NavigationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  return <>{children}</>;
};
