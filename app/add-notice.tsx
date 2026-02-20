import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import * as Haptics from 'expo-haptics';

export default function AddNoticeScreen() {
  const { addNotice, t } = useData();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(t('error'), t('errorEmpty'));
      return;
    }
    setSubmitting(true);
    try {
      await addNotice({ title: title.trim(), content: content.trim(), isUrgent });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('success'), t('successNotice'), [{ text: t('yes'), onPress: () => router.back() }]);
    } catch {
      Alert.alert(t('error'), t('errorLoginFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('title')} *</Text>
          <TextInput style={styles.input} placeholder={t('title')} placeholderTextColor={Colors.textTertiary} value={title} onChangeText={setTitle} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('content')} *</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder={t('content')} placeholderTextColor={Colors.textTertiary} value={content} onChangeText={setContent} multiline numberOfLines={5} textAlignVertical="top" />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('urgent')}</Text>
          <Switch value={isUrgent} onValueChange={setIsUrgent} trackColor={{ true: Colors.error, false: Colors.border }} thumbColor={Colors.white} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.85 }, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>{submitting ? '...' : t('addNotice')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text, marginBottom: 8 },
  input: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    fontSize: 15, fontFamily: 'NotoSansBengali_400Regular', color: Colors.text,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  textArea: { minHeight: 120 },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, padding: 16, borderRadius: 12, marginBottom: 20,
  },
  switchLabel: { fontSize: 15, fontFamily: 'NotoSansBengali_500Medium', color: Colors.text },
  submitButton: {
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  submitText: { fontSize: 16, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.white },
});
