import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

function formatAmount(amount: number): string {
  return '৳' + amount.toLocaleString('bn-BD');
}

function BalanceCard({ icon, label, amount, color, bg }: { icon: string; label: string; amount: number; color: string; bg: string }) {
  return (
    <View style={[styles.balanceCard, { backgroundColor: bg }]}>
      <View style={[styles.balanceIconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.balanceLabel}>{label}</Text>
      <Text style={[styles.balanceAmount, { color }]}>{formatAmount(amount)}</Text>
    </View>
  );
}

export default function UserHomeScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, notices, transactions, settings } = useData();
  const [refreshing, setRefreshing] = React.useState(false);

  if (!currentUser) return null;

  const userTransactions = transactions.filter(t => t.memberId === currentUser.id).slice(0, 5);
  const urgentNotices = notices.filter(n => n.isUrgent).slice(0, 3);
  const recentNotices = notices.slice(0, 3);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'জমা',
      withdrawal: 'উত্তোলন',
      share: 'শেয়ার',
      loan_disbursement: 'ঋণ গ্রহণ',
      loan_repayment: 'ঋণ পরিশোধ',
      dividend: 'লভ্যাংশ',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    if (type === 'deposit' || type === 'dividend' || type === 'loan_disbursement') return Colors.success;
    if (type === 'withdrawal' || type === 'loan_repayment') return Colors.error;
    return Colors.info;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>স্বাগতম,</Text>
          <Text style={styles.userName}>{currentUser.name}</Text>
        </View>
        <Pressable onPress={() => router.push('/profile')} style={styles.avatarButton}>
          <Ionicons name="person-circle" size={40} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={styles.sectionTitle}>আমার ব্যালেন্স</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.balanceRow}>
          <BalanceCard icon="layers" label="শেয়ার" amount={currentUser.shares * settings.sharePrice} color="#3B82F6" bg="#EFF6FF" />
          <BalanceCard icon="wallet" label="সঞ্চয়" amount={currentUser.savings} color={Colors.success} bg="#ECFDF5" />
          <BalanceCard icon="trending-down" label="ঋণ" amount={currentUser.loanBalance} color={Colors.error} bg="#FEF2F2" />
          <BalanceCard icon="gift" label="লভ্যাংশ" amount={currentUser.dividend} color={Colors.accent} bg="#FFFBEB" />
        </ScrollView>

        <View style={styles.quickActions}>
          <Pressable style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]} onPress={() => router.push('/loan-apply')}>
            <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="document-text" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.actionLabel}>ঋণ আবেদন</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]} onPress={() => router.push('/notices')}>
            <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="megaphone" size={22} color={Colors.accent} />
            </View>
            <Text style={styles.actionLabel}>নোটিশ</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]} onPress={() => router.push('/events')}>
            <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="calendar" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.actionLabel}>ইভেন্ট</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]} onPress={() => router.push('/support')}>
            <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="headset" size={22} color={Colors.success} />
            </View>
            <Text style={styles.actionLabel}>সাপোর্ট</Text>
          </Pressable>
        </View>

        {urgentNotices.length > 0 && (
          <View style={styles.urgentSection}>
            <View style={styles.urgentHeader}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.urgentTitle}>জরুরী নোটিশ</Text>
            </View>
            {urgentNotices.map(n => (
              <View key={n.id} style={styles.urgentCard}>
                <Text style={styles.urgentText}>{n.title}</Text>
                <Text style={styles.urgentDate}>{n.date}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>সাম্প্রতিক লেনদেন</Text>
        </View>

        {userTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>কোনো লেনদেন নেই</Text>
          </View>
        ) : (
          userTransactions.map(tx => (
            <View key={tx.id} style={styles.txCard}>
              <View style={[styles.txIcon, { backgroundColor: getTypeColor(tx.type) + '15' }]}>
                <Ionicons
                  name={tx.type.includes('loan') ? 'cash' : tx.type === 'deposit' ? 'arrow-down' : tx.type === 'withdrawal' ? 'arrow-up' : 'layers'}
                  size={18}
                  color={getTypeColor(tx.type)}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txType}>{getTypeLabel(tx.type)}</Text>
                <Text style={styles.txDesc}>{tx.description}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={[styles.txAmount, { color: getTypeColor(tx.type) }]}>
                  {(tx.type === 'withdrawal' || tx.type === 'loan_repayment') ? '-' : '+'}{formatAmount(tx.amount)}
                </Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
            </View>
          ))
        )}

        {recentNotices.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>নোটিশ বোর্ড</Text>
              <Pressable onPress={() => router.push('/notices')}>
                <Text style={styles.seeAll}>সব দেখুন</Text>
              </Pressable>
            </View>
            {recentNotices.map(n => (
              <View key={n.id} style={styles.noticeCard}>
                <View style={styles.noticeLeft}>
                  <MaterialCommunityIcons name="bulletin-board" size={20} color={Colors.primary} />
                </View>
                <View style={styles.noticeContent}>
                  <Text style={styles.noticeTitle}>{n.title}</Text>
                  <Text style={styles.noticeDate}>{n.date}</Text>
                </View>
                {n.isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>জরুরী</Text>
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
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
    paddingVertical: 12,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'NotoSansBengali_700Bold',
    color: Colors.text,
  },
  avatarButton: { padding: 4 },
  scrollContent: { paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
    marginBottom: 12,
    marginTop: 4,
  },
  balanceRow: { gap: 12, paddingBottom: 4, marginBottom: 16 },
  balanceCard: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  balanceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
  },
  balanceAmount: {
    fontSize: 16,
    fontFamily: 'NotoSansBengali_700Bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansBengali_500Medium',
    color: Colors.text,
    textAlign: 'center',
  },
  urgentSection: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  urgentTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.error,
  },
  urgentCard: {
    paddingVertical: 6,
  },
  urgentText: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_500Medium',
    color: Colors.text,
  },
  urgentDate: {
    fontSize: 11,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_500Medium',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textTertiary,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    gap: 12,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: { flex: 1 },
  txType: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
  },
  txDesc: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  txRight: { alignItems: 'flex-end' },
  txAmount: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_700Bold',
  },
  txDate: {
    fontSize: 11,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    gap: 12,
  },
  noticeLeft: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeContent: { flex: 1 },
  noticeTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_500Medium',
    color: Colors.text,
  },
  noticeDate: {
    fontSize: 11,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  urgentBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.white,
  },
});
