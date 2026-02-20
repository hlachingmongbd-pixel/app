import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import * as Haptics from 'expo-haptics';

export default function AdminSettingsScreen() {
  const { settings, updateSettings } = useData();
  const [interestRate, setInterestRate] = useState(settings.interestRate.toString());
  const [sharePrice, setSharePrice] = useState(settings.sharePrice.toString());
  const [maxLoan, setMaxLoan] = useState(settings.maxLoanAmount.toString());
  const [loanRate, setLoanRate] = useState(settings.loanInterestRate.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const ir = parseFloat(interestRate);
    const sp = parseInt(sharePrice);
    const ml = parseInt(maxLoan);
    const lr = parseFloat(loanRate);

    if (isNaN(ir) || isNaN(sp) || isNaN(ml) || isNaN(lr)) {
      Alert.alert('ত্রুটি', 'সকল মান সঠিকভাবে দিন');
      return;
    }

    setSaving(true);
    try {
      await updateSettings({
        interestRate: ir,
        sharePrice: sp,
        maxLoanAmount: ml,
        loanInterestRate: lr,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('সফল', 'সেটিংস আপডেট করা হয়েছে', [{ text: 'ঠিক আছে', onPress: () => router.back() }]);
    } catch {
      Alert.alert('ত্রুটি', 'সেটিংস আপডেট করতে ব্যর্থ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>সুদের হার সেটিংস</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>সঞ্চয় সুদের হার (%)</Text>
            <TextInput style={styles.input} value={interestRate} onChangeText={setInterestRate} keyboardType="decimal-pad" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ঋণ সুদের হার (%)</Text>
            <TextInput style={styles.input} value={loanRate} onChangeText={setLoanRate} keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="layers" size={20} color="#8B5CF6" />
            <Text style={styles.cardTitle}>শেয়ার সেটিংস</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>প্রতি শেয়ারের মূল্য (টাকা)</Text>
            <TextInput style={styles.input} value={sharePrice} onChangeText={setSharePrice} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash" size={20} color={Colors.error} />
            <Text style={styles.cardTitle}>ঋণ সেটিংস</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>সর্বোচ্চ ঋণের পরিমাণ (টাকা)</Text>
            <TextInput style={styles.input} value={maxLoan} onChangeText={setMaxLoan} keyboardType="numeric" />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85 }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: 10,
  },
  cardTitle: { fontSize: 16, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 14, fontFamily: 'NotoSansBengali_500Medium', color: Colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.background, borderRadius: 12, padding: 14,
    fontSize: 16, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  saveButton: {
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 4,
  },
  saveText: { fontSize: 16, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.white },
});
