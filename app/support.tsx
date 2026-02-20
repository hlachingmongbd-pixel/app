import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { useData } from '@/lib/data-context';

export default function SupportScreen() {
  const { t } = useData();
  const [message, setMessage] = useState('');

  const handleCall = () => {
    Linking.openURL('tel:+8801700000000').catch(() => {
      Alert.alert(t('error'), t('errorLoginFailed'));
    });
  };

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert(t('error'), t('errorEmpty'));
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(t('success'), t('infoSupport'));
    setMessage('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="call" size={20} color={Colors.success} />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardTitle}>{t('helpline')}</Text>
            <Text style={styles.cardSubtitle}>9 AM - 5 PM</Text>
          </View>
        </View>
        <Pressable style={({ pressed }) => [styles.callButton, pressed && { opacity: 0.7 }]} onPress={handleCall}>
          <Ionicons name="call" size={18} color={Colors.white} />
          <Text style={styles.callButtonText}>{t('callUs')}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="chatbubble-ellipses" size={20} color={Colors.info} />
          </View>
          <Text style={styles.cardTitle}>{t('messageUs')}</Text>
        </View>
        <TextInput
          style={styles.messageInput}
          placeholder={t('messageUs') + '...'}
          placeholderTextColor={Colors.textTertiary}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Pressable style={({ pressed }) => [styles.sendButton, pressed && { opacity: 0.85 }]} onPress={handleSend}>
          <Text style={styles.sendButtonText}>{t('yes')}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('rules')}</Text>
        <View style={styles.ruleItem}>
          <Ionicons name="chevron-forward-circle" size={16} color={Colors.primary} />
          <Text style={styles.ruleText}>{t('rule1')}</Text>
        </View>
        <View style={styles.ruleItem}>
          <Ionicons name="chevron-forward-circle" size={16} color={Colors.primary} />
          <Text style={styles.ruleText}>{t('rule2')}</Text>
        </View>
        <View style={styles.ruleItem}>
          <Ionicons name="chevron-forward-circle" size={16} color={Colors.primary} />
          <Text style={styles.ruleText}>{t('rule3')}</Text>
        </View>
        <View style={styles.ruleItem}>
          <Ionicons name="chevron-forward-circle" size={16} color={Colors.primary} />
          <Text style={styles.ruleText}>{t('rule4')}</Text>
        </View>
        <View style={styles.ruleItem}>
          <Ionicons name="chevron-forward-circle" size={16} color={Colors.primary} />
          <Text style={styles.ruleText}>{t('rule5')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 40, height: 40, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  cardHeaderInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text },
  cardSubtitle: { fontSize: 12, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textSecondary, marginTop: 2 },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: 12,
  },
  callButtonText: { fontSize: 15, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.white },
  messageInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.text,
    minHeight: 100,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: { fontSize: 15, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.white },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
  },
  ruleText: { flex: 1, fontSize: 14, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textSecondary, lineHeight: 22 },
});
