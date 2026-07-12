import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminGetAnalytics } from '../../services/api';
import type { AdminAnalytics } from '../../types';

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetAnalytics()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Users', value: analytics?.users ?? 0, icon: 'people' as const, color: '#3B82F6' },
    { label: 'Events', value: analytics?.events ?? 0, icon: 'calendar' as const, color: '#10B981' },
    { label: 'Bookings', value: analytics?.bookings ?? 0, icon: 'ticket' as const, color: '#F59E0B' },
    { label: 'Revenue', value: `Rs ${(analytics?.revenue ?? 0).toLocaleString()}`, icon: 'cash' as const, color: '#E43414' },
  ];

  const navItems = [
    { label: 'Users', screen: 'AdminUsers', icon: 'people' as const },
    { label: 'Events', screen: 'AdminEvents', icon: 'calendar' as const },
    { label: 'Billboards', screen: 'AdminBillboards', icon: 'image' as const },
    { label: 'Analytics', screen: 'AdminAnalytics', icon: 'bar-chart' as const },
    { label: 'Scrapper', screen: 'AdminScrapper', icon: 'server' as const },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Console</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color="#E43414" size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Platform Overview</Text>
            <View style={styles.statsGrid}>
              {statCards.map((card) => (
                <View key={card.label} style={styles.statCard}>
                  <Ionicons name={card.icon} size={20} color={card.color} />
                  <Text style={styles.statValue}>{card.value}</Text>
                  <Text style={styles.statLabel}>{card.label}</Text>
                </View>
              ))}
            </View>

            {analytics?.cityStats && analytics.cityStats.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>City Distribution</Text>
                {analytics.cityStats.map((stat) => {
                  const maxCount = Math.max(...analytics.cityStats.map((s) => s.count));
                  const pct = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
                  return (
                    <View key={stat.city} style={styles.cityRow}>
                      <Text style={styles.cityName}>{stat.city}</Text>
                      <View style={styles.barBg}>
                        <View style={[styles.barFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={styles.cityCount}>{stat.count}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Management</Text>
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.navItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.navIcon}>
                  <Ionicons name={item.icon} size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.navLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            ))}
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
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '47%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statValue: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginTop: 8 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  section: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cityName: { width: 80, fontSize: 13, color: '#FFFFFF', textTransform: 'capitalize' },
  barBg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8 },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: '#E43414' },
  cityCount: { width: 30, fontSize: 13, fontWeight: '600', color: '#FFFFFF', textAlign: 'right' },
  navItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  navIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  navLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
});
