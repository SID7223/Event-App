import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminGetEvents, adminUpdateEventStatus } from '../../services/api';

const tabs = ['all', 'pending', 'approved', 'rejected'];

export default function AdminEventsScreen() {
  const navigation = useNavigation<any>();
  const [status, setStatus] = useState('all');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminGetEvents({ page: 1, limit: 50, status: status === 'all' ? undefined : status })
      .then((res) => setEvents(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [status]);

  const handleStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await adminUpdateEventStatus(id, newStatus);
      fetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Event Moderation</Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <TouchableOpacity key={t} onPress={() => setStatus(t)} style={[styles.tab, status === t && styles.tabActive]}>
            <Text style={[styles.tabText, status === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color="#E43414" size="large" style={{ marginTop: 40 }} />
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>{event.city} &middot; {event.date}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleStatus(event.id, 'approved')} style={styles.approveBtn}>
                  <Ionicons name="checkmark" size={18} color="#10B981" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStatus(event.id, 'rejected')} style={styles.rejectBtn}>
                  <Ionicons name="close" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
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
  tabText: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' },
  tabTextActive: { color: '#E43414' },
  scroll: { padding: 16, paddingTop: 0 },
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  eventTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  eventMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  approveBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.15)', justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.15)', justifyContent: 'center', alignItems: 'center' },
});
