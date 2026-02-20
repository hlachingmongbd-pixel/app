import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { DataProvider, useData } from "@/lib/data-context";
import { useFonts, NotoSansBengali_400Regular, NotoSansBengali_500Medium, NotoSansBengali_600SemiBold, NotoSansBengali_700Bold } from "@expo-google-fonts/noto-sans-bengali";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { t } = useData();
  return (
    <Stack screenOptions={{ headerBackTitle: t('home') }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(user-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="loan-apply" options={{ title: t('loanApply'), headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="add-member" options={{ title: t('addNewMember'), headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="member-detail" options={{ title: t('info'), headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="notices" options={{ title: t('notice'), headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="events" options={{ title: t('events'), headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="support" options={{ title: t('support'), headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="profile" options={{ title: t('profile'), headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="add-notice" options={{ title: t('noticePost'), headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="add-event" options={{ title: t('createEvent'), headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="admin-settings" options={{ title: t('settings'), headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="add-transaction" options={{ title: t('transactionEntry'), headerTintColor: '#0D6B3F' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSansBengali_400Regular,
    NotoSansBengali_500Medium,
    NotoSansBengali_600SemiBold,
    NotoSansBengali_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <DataProvider>
              <RootLayoutNav />
            </DataProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
