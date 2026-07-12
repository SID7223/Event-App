import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminGetScrapperEvents, adminMarkScrapperEventContacted, adminGetScrapperTopOrganizers, adminMarkTopOrganizerContacted } from '../../services/api';

const tabs = ['Events', 'Top Organizers'];

export default function AdminScrapperScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState('Events');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    const promise = tab === 'Events' ? adminGetScrapperEvents({ page: 1, limit: 50 }) : adminGetScrapperTopOrganizers({ page: 1, limit: 50 });
    promise.then((res) => setItems(res.items)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [tab]);

  const handleContact = async (id: string) => {
    try {
      if (tab === 'Events') await adminMarkScrapperEventContacted(id);
      else await adminMarkTopOrganizerContacted(id);
      fetch();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Scrapper Data</Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color="#E43414" size="large" style={{ marginTop: 40 }} />
        ) : (
          items.map((item, i) => (
            <View key={item.id || i} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title || item.name}</Text>
                <Text style={styles.cardMeta}>{item.source} &middot; {item.city || item.location}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleContact(item.id)}
                disabled={item.contacted === 1}
                style={[styles.contactBtn, item.contacted === 1 && styles.contactedBtn]}
              >
                <Ionicons name="call" size={14} color={item.contacted === 1 ? '#10B981' : 'rgba(255,255,255,0.6)'} />
                <Text style={[styles.contactText, item.contacted === 1 && styles.contactedText]}>
                  {item.contacted === 1 ? 'Done' : 'Contact'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
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
  tabRow: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)' },
  tabActive: { backgroundColor: 'rgba(228,52,20,0.2)' },
  tabText: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.5)' },
  tabTextActive: { color: '#E43414' },
  scroll: { padding: 16, paddingTop: 0 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  cardMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  contactedBtn: { backgroundColor: 'rgba(16,185,129,0.15)' },
  contactText: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  contactedText: { color: '#10B981' },
});
