import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import * as Haptics from 'expo-haptics';

interface MenuItemProps {
  icon: string;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}

function MenuItem({ icon, label, color, bg, onPress }: MenuItemProps) {
  return (
    <Pressable style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </Pressable>
  );
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, logout } = useData();

  if (!currentUser) return null;

  const handleLogout = () => {
    Alert.alert('লগআউট', 'আপনি কি লগআউট করতে চান?', [
      { text: 'না', style: 'cancel' },
      {
        text: 'হ্যাঁ',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <Text style={styles.pageTitle}>আরও</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={30} color={Colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileId}>সদস্য আইডি: {currentUser.id}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>অ্যাকাউন্ট</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="person" label="আমার প্রোফাইল" color="#3B82F6" bg="#EFF6FF" onPress={() => router.push('/profile')} />
          <MenuItem icon="document-text" label="ঋণের আবেদন" color="#8B5CF6" bg="#F3E8FF" onPress={() => router.push('/loan-apply')} />
        </View>

        <Text style={styles.sectionLabel}>তথ্য</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="megaphone" label="নোটিশ বোর্ড" color={Colors.accent} bg="#FEF3C7" onPress={() => router.push('/notices')} />
          <MenuItem icon="calendar" label="সভা ও ইভেন্ট" color="#8B5CF6" bg="#F3E8FF" onPress={() => router.push('/events')} />
          <MenuItem icon="headset" label="সাপোর্ট" color={Colors.success} bg="#ECFDF5" onPress={() => router.push('/support')} />
        </View>

        <Pressable style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.7 }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>লগআউট</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'NotoSansBengali_700Bold',
    color: Colors.text,
    paddingVertical: 14,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 14,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 17,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
  },
  profileId: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuGroup: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'NotoSansBengali_500Medium',
    color: Colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.error,
  },
});
