import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { DataProvider } from "@/lib/data-context";
import { useFonts, NotoSansBengali_400Regular, NotoSansBengali_500Medium, NotoSansBengali_600SemiBold, NotoSansBengali_700Bold } from "@expo-google-fonts/noto-sans-bengali";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(user-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="loan-apply" options={{ title: "ঋণের আবেদন", headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="add-member" options={{ title: "নতুন সদস্য যোগ", headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="member-detail" options={{ title: "সদস্য তথ্য", headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="notices" options={{ title: "নোটিশ বোর্ড", headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="events" options={{ title: "সভা ও ইভেন্ট", headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="support" options={{ title: "সাপোর্ট", headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="profile" options={{ title: "আমার প্রোফাইল", headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="add-notice" options={{ title: "নোটিশ পোস্ট", headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="add-event" options={{ title: "ইভেন্ট তৈরি", headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="admin-settings" options={{ title: "সেটিংস", headerTintColor: '#0D6B3F' }} />
      <Stack.Screen name="add-transaction" options={{ title: "লেনদেন এন্ট্রি", headerTintColor: '#0D6B3F' }} />
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
