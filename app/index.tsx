import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, currentUser, isAdmin, isLoading, t, language, setLanguage } = useData();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [logging, setLogging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role === 'admin') {
        router.replace('/(admin-tabs)');
      } else {
        router.replace('/(user-tabs)');
      }
    }
  }, [isLoading, currentUser]);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setError(t('errorMissing'));
      return;
    }
    setLogging(true);
    setError('');
    try {
      const success = await login(phone.trim(), password.trim());
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(t('errorInvalid'));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setError(t('errorLoginFailed'));
    } finally {
      setLogging(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (currentUser) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={['#0D6B3F', '#094D2D', '#063520']} style={[styles.topSection, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 40 }]}>
          <Pressable
            style={styles.langSwitch}
            onPress={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
          >
            <Text style={styles.langText}>{language === 'bn' ? '🇺🇸 ENG' : '🇧🇩 বাং'}</Text>
          </Pressable>

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image source={require('../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
          </View>
          <Text style={styles.appTitle}>{t('appTitle')}</Text>
          <Text style={styles.appSubtitle}>{t('appSubtitle')}</Text>
        </LinearGradient>

        <View style={[styles.formSection, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }]}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{t('loginTitle')}</Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('phonePlaceholder')}
                  placeholderTextColor={Colors.textTertiary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={t('passwordPlaceholder')}
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed, logging && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={logging}
            >
              {logging ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.loginButtonText}>{t('loginButton')}</Text>
              )}
            </Pressable>

            <View style={styles.demoInfo}>
              <Text style={styles.demoTitle}>{t('demoAccount')}</Text>
              <Text style={styles.demoText}>{t('admin')}: 01700000000 / admin123</Text>
              <Text style={styles.demoText}>{t('member')}: 01711111111 / 123</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  topSection: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    alignItems: 'center',
    position: 'relative',
  },
  langSwitch: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  langText: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 0,
    fontFamily: 'NotoSansBengali_600SemiBold',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appTitle: {
    fontSize: 22,
    fontFamily: 'NotoSansBengali_700Bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  appSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: -30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 12,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.text,
  },
  eyeButton: {
    padding: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.error,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.white,
  },
  demoInfo: {
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 12,
    gap: 4,
  },
  demoTitle: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.primary,
    marginBottom: 2,
  },
  demoText: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.primaryDark,
  },
});
