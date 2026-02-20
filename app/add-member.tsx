import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import * as Haptics from 'expo-haptics';

export default function AddMemberScreen() {
  const { addMember, settings } = useData();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [nid, setNid] = useState('');
  const [initialShares, setInitialShares] = useState('1');
  const [password, setPassword] = useState('1234');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('ত্রুটি', 'নাম, ফোন ও ঠিকানা আবশ্যক');
      return;
    }
    if (phone.trim().length < 11) {
      Alert.alert('ত্রুটি', 'সঠিক ফোন নম্বর দিন');
      return;
    }

    setSubmitting(true);
    try {
      await addMember({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        nid: nid.trim(),
        photo: '',
        joinDate: new Date().toISOString().split('T')[0],
        shares: parseInt(initialShares) || 1,
        savings: 0,
        loanBalance: 0,
        dividend: 0,
        isActive: true,
        role: 'user',
        password: password || '1234',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('সফল', 'নতুন সদস্য যোগ করা হয়েছে', [{ text: 'ঠিক আছে', onPress: () => router.back() }]);
    } catch {
      Alert.alert('ত্রুটি', 'সদস্য যোগ করতে ব্যর্থ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>সদস্যের নাম *</Text>
          <TextInput style={styles.input} placeholder="পূর্ণ নাম" placeholderTextColor={Colors.textTertiary} value={name} onChangeText={setName} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ফোন নম্বর *</Text>
          <TextInput style={styles.input} placeholder="01XXXXXXXXX" placeholderTextColor={Colors.textTertiary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ঠিকানা *</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="সম্পূর্ণ ঠিকানা" placeholderTextColor={Colors.textTertiary} value={address} onChangeText={setAddress} multiline textAlignVertical="top" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>জাতীয় পরিচয়পত্র নম্বর</Text>
          <TextInput style={styles.input} placeholder="NID নম্বর" placeholderTextColor={Colors.textTertiary} value={nid} onChangeText={setNid} keyboardType="numeric" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>প্রাথমিক শেয়ার সংখ্যা</Text>
          <TextInput style={styles.input} placeholder="1" placeholderTextColor={Colors.textTertiary} value={initialShares} onChangeText={setInitialShares} keyboardType="numeric" />
          <Text style={styles.hint}>প্রতি শেয়ার ৳{settings.sharePrice}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>পাসওয়ার্ড</Text>
          <TextInput style={styles.input} placeholder="1234" placeholderTextColor={Colors.textTertiary} value={password} onChangeText={setPassword} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.85 }, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>{submitting ? 'যোগ হচ্ছে...' : 'সদস্য যোগ করুন'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
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
  textArea: { minHeight: 70 },
  hint: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textTertiary,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    fontSize: 16,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.white,
  },
});
