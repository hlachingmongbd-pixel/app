import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import * as Haptics from 'expo-haptics';

export default function AddEventScreen() {
  const { addEvent, t } = useData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [type, setType] = useState<'meeting' | 'event'>('meeting');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !date.trim() || !time.trim() || !venue.trim()) {
      Alert.alert(t('error'), t('errorEmpty'));
      return;
    }
    setSubmitting(true);
    try {
      await addEvent({
        title: title.trim(),
        description: description.trim(),
        date: date.trim(),
        time: time.trim(),
        venue: venue.trim(),
        type,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('success'), t('successEvent'), [{ text: t('yes'), onPress: () => router.back() }]);
    } catch {
      Alert.alert(t('error'), t('errorLoginFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeButton, type === 'meeting' && styles.typeActive]}
            onPress={() => setType('meeting')}
          >
            <Ionicons name="people" size={18} color={type === 'meeting' ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.typeText, type === 'meeting' && styles.typeTextActive]}>{t('meeting')}</Text>
          </Pressable>
          <Pressable
            style={[styles.typeButton, type === 'event' && styles.typeActive]}
            onPress={() => setType('event')}
          >
            <Ionicons name="calendar" size={18} color={type === 'event' ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.typeText, type === 'event' && styles.typeTextActive]}>{t('event')}</Text>
          </Pressable>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('title')} *</Text>
          <TextInput style={styles.input} placeholder={t('title')} placeholderTextColor={Colors.textTertiary} value={title} onChangeText={setTitle} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('info')}</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder={t('info')} placeholderTextColor={Colors.textTertiary} value={description} onChangeText={setDescription} multiline textAlignVertical="top" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('date')} * (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} placeholder="2025-03-15" placeholderTextColor={Colors.textTertiary} value={date} onChangeText={setDate} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('time')} *</Text>
          <TextInput style={styles.input} placeholder="02:00 PM" placeholderTextColor={Colors.textTertiary} value={time} onChangeText={setTime} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('venue')} *</Text>
          <TextInput style={styles.input} placeholder={t('venue')} placeholderTextColor={Colors.textTertiary} value={venue} onChangeText={setVenue} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.85 }, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>{submitting ? '...' : t('addEvent')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  typeButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
  },
  typeActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { fontSize: 14, fontFamily: 'NotoSansBengali_500Medium', color: Colors.textSecondary },
  typeTextActive: { color: Colors.white },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text, marginBottom: 8 },
  input: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    fontSize: 15, fontFamily: 'NotoSansBengali_400Regular', color: Colors.text,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  textArea: { minHeight: 80 },
  submitButton: {
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 4,
  },
  submitText: { fontSize: 16, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.white },
});
