import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import * as Haptics from 'expo-haptics';

const TX_TYPES = [
  { key: 'deposit', label: 'জমা', icon: 'arrow-down-circle', color: Colors.success },
  { key: 'withdrawal', label: 'উত্তোলন', icon: 'arrow-up-circle', color: Colors.error },
  { key: 'share', label: 'শেয়ার এন্ট্রি', icon: 'layers', color: '#3B82F6' },
  { key: 'loan_repayment', label: 'ঋণ কিস্তি', icon: 'cash', color: '#8B5CF6' },
];

export default function AddTransactionScreen() {
  const { members, addTransaction } = useData();
  const [selectedType, setSelectedType] = useState('deposit');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const regularMembers = members.filter(m => m.role !== 'admin' && m.isActive);
  const filteredMembers = memberSearch.trim()
    ? regularMembers.filter(m => m.name.includes(memberSearch) || m.phone.includes(memberSearch))
    : regularMembers;

  const selectedMember = members.find(m => m.id === selectedMemberId);

  const handleSubmit = async () => {
    if (!selectedMemberId) {
      Alert.alert('ত্রুটি', 'সদস্য নির্বাচন করুন');
      return;
    }
    if (!amount.trim() || isNaN(parseInt(amount)) || parseInt(amount) <= 0) {
      Alert.alert('ত্রুটি', 'সঠিক পরিমাণ দিন');
      return;
    }

    setSubmitting(true);
    try {
      const member = members.find(m => m.id === selectedMemberId);
      await addTransaction({
        memberId: selectedMemberId,
        memberName: member?.name || '',
        type: selectedType as any,
        amount: parseInt(amount),
        date: new Date().toISOString().split('T')[0],
        description: description.trim() || TX_TYPES.find(t => t.key === selectedType)?.label || '',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('সফল', 'লেনদেন রেকর্ড করা হয়েছে', [{ text: 'ঠিক আছে', onPress: () => router.back() }]);
    } catch {
      Alert.alert('ত্রুটি', 'লেনদেন রেকর্ড করতে ব্যর্থ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>লেনদেনের ধরন</Text>
        <View style={styles.typeGrid}>
          {TX_TYPES.map(t => (
            <Pressable
              key={t.key}
              style={[styles.typeCard, selectedType === t.key && { borderColor: t.color, borderWidth: 2, backgroundColor: t.color + '10' }]}
              onPress={() => setSelectedType(t.key)}
            >
              <Ionicons name={t.icon as any} size={22} color={t.color} />
              <Text style={[styles.typeLabel, selectedType === t.key && { color: t.color }]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>সদস্য নির্বাচন</Text>
        {selectedMember ? (
          <View style={styles.selectedMember}>
            <View style={styles.memberAvatar}>
              <Ionicons name="person" size={18} color={Colors.primary} />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{selectedMember.name}</Text>
              <Text style={styles.memberPhone}>{selectedMember.phone}</Text>
            </View>
            <Pressable onPress={() => { setSelectedMemberId(''); setMemberSearch(''); }}>
              <Ionicons name="close-circle" size={22} color={Colors.textTertiary} />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.searchWrapper}>
              <Ionicons name="search" size={16} color={Colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="সদস্য খুঁজুন..."
                placeholderTextColor={Colors.textTertiary}
                value={memberSearch}
                onChangeText={setMemberSearch}
              />
            </View>
            <View style={styles.memberList}>
              {filteredMembers.slice(0, 5).map(m => (
                <Pressable
                  key={m.id}
                  style={({ pressed }) => [styles.memberOption, pressed && { backgroundColor: Colors.primaryLight }]}
                  onPress={() => { setSelectedMemberId(m.id); setMemberSearch(''); }}
                >
                  <Text style={styles.memberOptionName}>{m.name}</Text>
                  <Text style={styles.memberOptionPhone}>{m.phone}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>পরিমাণ (টাকা)</Text>
          <TextInput style={styles.input} placeholder="0" placeholderTextColor={Colors.textTertiary} value={amount} onChangeText={setAmount} keyboardType="numeric" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>বিবরণ (ঐচ্ছিক)</Text>
          <TextInput style={styles.input} placeholder="লেনদেনের বিবরণ" placeholderTextColor={Colors.textTertiary} value={description} onChangeText={setDescription} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.85 }, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>{submitting ? 'রেকর্ড হচ্ছে...' : 'লেনদেন রেকর্ড করুন'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 14, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text, marginBottom: 10,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeCard: {
    flexBasis: '47%' as any, flexGrow: 1,
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  typeLabel: { fontSize: 13, fontFamily: 'NotoSansBengali_500Medium', color: Colors.textSecondary },
  selectedMember: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primaryLight, padding: 14, borderRadius: 14, marginBottom: 16,
  },
  memberAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text },
  memberPhone: { fontSize: 12, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textSecondary },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 12, marginBottom: 8,
  },
  searchInput: {
    flex: 1, paddingVertical: 12, fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular', color: Colors.text,
  },
  memberList: { marginBottom: 16 },
  memberOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, padding: 12, borderRadius: 10, marginBottom: 4,
  },
  memberOptionName: { fontSize: 14, fontFamily: 'NotoSansBengali_500Medium', color: Colors.text },
  memberOptionPhone: { fontSize: 12, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textSecondary },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text, marginBottom: 8 },
  input: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    fontSize: 15, fontFamily: 'NotoSansBengali_400Regular', color: Colors.text,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  submitButton: {
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 4,
  },
  submitText: { fontSize: 16, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.white },
});
