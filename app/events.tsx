import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData, MeetingEvent } from '@/lib/data-context';

function EventItem({ item, t }: { item: MeetingEvent; t: (key: any) => string }) {
  const isMeeting = item.type === 'meeting';

  const getMonthAbbr = (m: string) => {
    const months: Record<string, any> = {
      '01': 'jan', '02': 'feb', '03': 'mar', '04': 'apr',
      '05': 'may', '06': 'jun', '07': 'jul', '08': 'aug',
      '09': 'sep', '10': 'oct', '11': 'nov', '12': 'dec',
    };
    return t(months[m] || m);
  };

  return (
    <View style={styles.card}>
      <View style={styles.dateBox}>
        <Text style={styles.dateDay}>{item.date.split('-')[2]}</Text>
        <Text style={styles.dateMonth}>{getMonthAbbr(item.date.split('-')[1])}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.typeBadge}>
          <Ionicons name={isMeeting ? 'people' : 'calendar'} size={12} color={isMeeting ? Colors.info : '#8B5CF6'} />
          <Text style={[styles.typeText, { color: isMeeting ? Colors.info : '#8B5CF6' }]}>
            {t(item.type as any)}
          </Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.metaText}>{item.time}</Text>
          <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.metaText}>{item.venue}</Text>
        </View>
      </View>
    </View>
  );
}

export default function EventsScreen() {
  const { events, t } = useData();

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <EventItem item={item} t={t} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>{t('noEvents')}</Text>
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
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  dateBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  dateDay: { fontSize: 20, fontFamily: 'NotoSansBengali_700Bold', color: Colors.primary },
  dateMonth: { fontSize: 10, fontFamily: 'NotoSansBengali_500Medium', color: Colors.primaryDark },
  cardContent: { flex: 1 },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', marginBottom: 4,
  },
  typeText: { fontSize: 11, fontFamily: 'NotoSansBengali_600SemiBold' },
  title: { fontSize: 15, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text, marginBottom: 2 },
  description: { fontSize: 13, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textSecondary, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textTertiary, marginRight: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textTertiary },
});
