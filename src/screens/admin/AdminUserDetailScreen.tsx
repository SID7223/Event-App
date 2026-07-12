import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { adminGetUser, adminUpdateUserRole } from '../../services/api';

export default function AdminUserDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminGetUser(userId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleRoleChange = async (role: string) => {
    try {
      await adminUpdateUserRole(userId, role as any);
      alert('Role updated');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#E43414" size="large" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>User Detail</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Info</Text>
          {[['Name', `${data?.user?.firstName} ${data?.user?.lastName}`],
            ['Email', data?.user?.email],
            ['Phone', data?.user?.phone || '—'],
            ['Role', data?.user?.role || 'user'],
          ].map(([label, value]) => (
            <View key={label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          ))}
          <View style={styles.roleActions}>
            {['user', 'creator', 'admin'].map((role) => (
              <TouchableOpacity
                key={role}
                onPress={() => handleRoleChange(role)}
                style={[styles.roleBtn, data?.user?.role === role && styles.roleBtnActive]}
              >
                <Text style={[styles.roleBtnText, data?.user?.role === role && styles.roleBtnTextActive]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {data?.sessions?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sessions ({data.sessions.length})</Text>
            {data.sessions.map((s: any) => (
              <View key={s.id} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{s.device || 'Device'}</Text>
                <Text style={styles.infoValue}>{s.ip}</Text>
              </View>
            ))}
          </View>
        )}

        {data?.events?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Events ({data.events.length})</Text>
            {data.events.map((e: any) => (
              <View key={e.id} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{e.title}</Text>
                <Text style={styles.infoValue}>{e.status || 'draft'}</Text>
              </View>
            ))}
          </View>
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
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  infoValue: { fontSize: 13, fontWeight: '500', color: '#FFFFFF' },
  roleActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  roleBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  roleBtnActive: { backgroundColor: 'rgba(228,52,20,0.2)' },
  roleBtnText: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' },
  roleBtnTextActive: { color: '#E43414' },
});
