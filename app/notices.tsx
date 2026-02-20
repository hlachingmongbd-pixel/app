import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData, Notice } from '@/lib/data-context';

function NoticeItem({ item, t }: { item: Notice; t: (key: any) => string }) {
  return (
    <View style={[styles.card, item.isUrgent && styles.urgentCard]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, item.isUrgent ? { backgroundColor: '#FEF2F2' } : { backgroundColor: Colors.primaryLight }]}>
          <Ionicons name={item.isUrgent ? 'alert-circle' : 'megaphone'} size={18} color={item.isUrgent ? Colors.error : Colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        {item.isUrgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentBadgeText}>{t('urgent')}</Text>
          </View>
        )}
      </View>
      <Text style={styles.content}>{item.content}</Text>
    </View>
  );
}

export default function NoticesScreen() {
  const { notices, t } = useData();

  return (
    <View style={styles.container}>
      <FlatList
        data={notices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NoticeItem item={item} t={t} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>{t('noNotices')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  urgentCard: { borderLeftWidth: 3, borderLeftColor: Colors.error },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 36, height: 36, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  headerInfo: { flex: 1 },
  title: { fontSize: 15, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text },
  date: { fontSize: 12, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textTertiary, marginTop: 2 },
  urgentBadge: { backgroundColor: Colors.error, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  urgentBadgeText: { fontSize: 10, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.white },
  content: { fontSize: 14, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textSecondary, lineHeight: 22 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textTertiary },
});
