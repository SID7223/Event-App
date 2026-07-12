import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminGetAnalyticsDetail } from '../../services/api';

const tables = [
  { key: 'search-logs', label: 'Search Logs', icon: 'search' as const },
  { key: 'button-clicks', label: 'Button Clicks', icon: 'hand-left' as const },
  { key: 'content-engagement', label: 'Content Engagement', icon: 'newspaper' as const },
  { key: 'social-shares', label: 'Social Shares', icon: 'share-social' as const },
  { key: 'creator-conversion', label: 'Creator Conversion', icon: 'trending-up' as const },
  { key: 'booking-funnel', label: 'Booking Funnel', icon: 'funnel' as const },
];

export default function AdminAnalyticsScreen() {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    adminGetAnalyticsDetail(selected, { page: 1, limit: 50 })
      .then((res) => setItems(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {!selected ? (
          <View style={styles.grid}>
            {tables.map((t) => (
              <TouchableOpacity key={t.key} style={styles.gridItem} onPress={() => setSelected(t.key)}>
                <Ionicons name={t.icon} size={24} color="#E43414" />
                <Text style={styles.gridLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backLink}>
              <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={styles.backLinkText}>All tables</Text>
            </TouchableOpacity>
            {loading ? (
              <ActivityIndicator color="#E43414" size="large" style={{ marginTop: 40 }} />
            ) : (
              items.map((item, i) => (
                <View key={item.id || i} style={styles.row}>
                  {Object.entries(item).filter(([k]) => k !== 'id').slice(0, 3).map(([key, val]) => (
                    <Text key={key} style={styles.cell}>
                      {String(val ?? '—')}
                    </Text>
                  ))}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  title: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  scroll: { padding: 16, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '47%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  gridLabel: { fontSize: 13, fontWeight: '500', color: '#FFFFFF', marginTop: 8, textAlign: 'center' },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backLinkText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  row: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, marginBottom: 6, flexDirection: 'row', gap: 12 },
  cell: { fontSize: 12, color: '#FFFFFF', flex: 1 },
});
