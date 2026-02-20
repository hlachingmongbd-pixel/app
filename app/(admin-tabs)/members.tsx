import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useData, Member } from '@/lib/data-context';
import * as Haptics from 'expo-haptics';

function MemberItem({ member, onToggle, t }: { member: Member; onToggle: () => void; t: any }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.memberCard, pressed && { opacity: 0.85 }]}
      onPress={() => router.push({ pathname: '/member-detail', params: { id: member.id } })}
    >
      <View style={[styles.memberAvatar, !member.isActive && { opacity: 0.5 }]}>
        <Ionicons name="person" size={22} color={Colors.primary} />
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberPhone}>{member.phone}</Text>
      </View>
      <View style={styles.memberRight}>
        <Pressable
          style={[styles.statusToggle, member.isActive ? styles.activeToggle : styles.inactiveToggle]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle();
          }}
        >
          <Text style={[styles.statusText, member.isActive ? styles.activeText : styles.inactiveText]}>
            {member.isActive ? t('active') : t('inactive')}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function MembersScreen() {
  const insets = useSafeAreaInsets();
  const { members, toggleMemberStatus, t } = useData();
  const [search, setSearch] = useState('');

  const regularMembers = members.filter(m => m.role !== 'admin');
  const filtered = search.trim()
    ? regularMembers.filter(m =>
      m.name.includes(search) || m.phone.includes(search) || m.id.includes(search)
    )
    : regularMembers;

  const handleToggle = (member: Member) => {
    Alert.alert(
      member.isActive ? t('deactivate') : t('activate'),
      `${member.name} ${member.isActive ? t('deactivateConfirm') : t('activateConfirm')}`,
      [
        { text: t('no'), style: 'cancel' },
        { text: t('yes'), onPress: () => toggleMemberStatus(member.id) },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>{t('memberManagement')}</Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/add-member')}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchMember')}
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countText}>{t('total')}: {filtered.length} {t('person')}</Text>
        <Text style={styles.countText}>{t('active')}: {filtered.filter(m => m.isActive).length}</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MemberItem member={item} onToggle={() => handleToggle(item)} t={t} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>{t('noMembersFound')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'NotoSansBengali_700Bold',
    color: Colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.text,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  countText: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_500Medium',
    color: Colors.textSecondary,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    gap: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 15,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
  },
  memberPhone: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  memberRight: {},
  statusToggle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeToggle: { backgroundColor: '#ECFDF5' },
  inactiveToggle: { backgroundColor: '#FEF2F2' },
  statusText: {
    fontSize: 11,
    fontFamily: 'NotoSansBengali_600SemiBold',
  },
  activeText: { color: Colors.success },
  inactiveText: { color: Colors.error },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textTertiary,
  },
});
