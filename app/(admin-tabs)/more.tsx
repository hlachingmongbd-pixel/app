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
  badge?: string;
}

function MenuItem({ icon, label, color, bg, onPress, badge }: MenuItemProps) {
  return (
    <Pressable style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </Pressable>
  );
}

export default function AdminMoreScreen() {
  const insets = useSafeAreaInsets();
  const { logout, loanApplications, t } = useData();

  const pendingCount = loanApplications.filter(l => l.status === 'pending').length;

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
        <Text style={styles.sectionLabel}>{t('members')}</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="person-add" label={t('addNewMember')} color="#3B82F6" bg="#EFF6FF" onPress={() => router.push('/add-member')} />
        </View>

        <Text style={styles.sectionLabel}>{t('notice')} & {t('events')}</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="megaphone" label={t('noticePost')} color={Colors.accent} bg="#FEF3C7" onPress={() => router.push('/add-notice')} />
          <MenuItem icon="calendar" label={t('createEvent')} color="#8B5CF6" bg="#F3E8FF" onPress={() => router.push('/add-event')} />
          <MenuItem icon="list" label={t('allNotices')} color={Colors.primary} bg={Colors.primaryLight} onPress={() => router.push('/notices')} />
          <MenuItem icon="today" label={t('events')} color="#EC4899" bg="#FCE7F3" onPress={() => router.push('/events')} />
        </View>

        <Text style={styles.sectionLabel}>{t('settings')}</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="settings" label={t('interestShareSettings')} color="#6366F1" bg="#EEF2FF" onPress={() => router.push('/admin-settings')} />
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
  badge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.white,
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
