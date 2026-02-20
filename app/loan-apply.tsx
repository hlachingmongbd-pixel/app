import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import * as Haptics from 'expo-haptics';

export default function LoanApplyScreen() {
  const { currentUser, applyForLoan, settings } = useData();
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser) return null;

  const handleSubmit = async () => {
    if (!amount.trim() || !purpose.trim() || !duration.trim()) {
      Alert.alert('ত্রুটি', 'সকল তথ্য পূরণ করুন');
      return;
    }
    const amountNum = parseInt(amount);
    const durationNum = parseInt(duration);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('ত্রুটি', 'সঠিক পরিমাণ দিন');
      return;
    }
    if (amountNum > settings.maxLoanAmount) {
      Alert.alert('ত্রুটি', `সর্বোচ্চ ঋণের পরিমাণ ৳${settings.maxLoanAmount.toLocaleString()}`);
      return;
    }
    if (isNaN(durationNum) || durationNum <= 0 || durationNum > 60) {
      Alert.alert('ত্রুটি', 'মেয়াদ ১-৬০ মাসের মধ্যে হতে হবে');
      return;
    }

    setSubmitting(true);
    try {
      await applyForLoan({
        memberId: currentUser.id,
        memberName: currentUser.name,
        amount: amountNum,
        purpose: purpose.trim(),
        duration: durationNum,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('সফল', 'ঋণের আবেদন জমা হয়েছে', [{ text: 'ঠিক আছে', onPress: () => router.back() }]);
    } catch {
      Alert.alert('ত্রুটি', 'আবেদন জমা দিতে ব্যর্থ');
    } finally {
      setSubmitting(false);
    }
  };

  const estimatedInstallment = amount && duration
    ? Math.ceil((parseInt(amount) * (1 + settings.loanInterestRate / 100)) / parseInt(duration))
    : 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            সর্বোচ্চ ঋণ: ৳{settings.maxLoanAmount.toLocaleString()} | সুদের হার: {settings.loanInterestRate}%
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ঋণের পরিমাণ (টাকা)</Text>
          <TextInput
            style={styles.input}
            placeholder="যেমন: 50000"
            placeholderTextColor={Colors.textTertiary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ঋণের উদ্দেশ্য</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="ঋণের কারণ লিখুন"
            placeholderTextColor={Colors.textTertiary}
            value={purpose}
            onChangeText={setPurpose}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>মেয়াদ (মাস)</Text>
          <TextInput
            style={styles.input}
            placeholder="যেমন: 12"
            placeholderTextColor={Colors.textTertiary}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        {estimatedInstallment > 0 && !isNaN(estimatedInstallment) && (
          <View style={styles.estimateCard}>
            <Text style={styles.estimateTitle}>আনুমানিক মাসিক কিস্তি</Text>
            <Text style={styles.estimateAmount}>৳{estimatedInstallment.toLocaleString()}</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.85 }, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>{submitting ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.info,
  },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  textArea: { minHeight: 80 },
  estimateCard: {
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  estimateTitle: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.primaryDark,
  },
  estimateAmount: {
    fontSize: 24,
    fontFamily: 'NotoSansBengali_700Bold',
    color: Colors.primary,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.white,
  },
});
