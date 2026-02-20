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
  const { currentUser, logout, t } = useData();

  if (!currentUser) return null;

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('logoutConfirm'))) {
        logout();
        router.replace('/');
      }
      return;
    }

    Alert.alert(t('logout'), t('logoutConfirm'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
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
      <Text style={styles.pageTitle}>{t('more')}</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={30} color={Colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileId}>{t('memberId')}: {currentUser.id}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t('account')}</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="person" label={t('myProfile')} color="#3B82F6" bg="#EFF6FF" onPress={() => router.push('/profile')} />
          <MenuItem icon="document-text" label={t('loanApply')} color="#8B5CF6" bg="#F3E8FF" onPress={() => router.push('/loan-apply')} />
        </View>

        <Text style={styles.sectionLabel}>{t('info')}</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="megaphone" label={t('noticeBoard')} color={Colors.accent} bg="#FEF3C7" onPress={() => router.push('/notices')} />
          <MenuItem icon="calendar" label={t('events')} color="#8B5CF6" bg="#F3E8FF" onPress={() => router.push('/events')} />
          <MenuItem icon="headset" label={t('support')} color={Colors.success} bg="#ECFDF5" onPress={() => router.push('/support')} />
        </View>

        <Pressable style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.7 }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
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
