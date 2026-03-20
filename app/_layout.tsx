import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/src/context/AuthContext';
import { NavigationWrapper } from '@/src/components/NavigationWrapper';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <NavigationWrapper>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </NavigationWrapper>
    </AuthProvider>
  );
}
