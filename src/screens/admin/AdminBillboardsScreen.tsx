import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminGetBillboards, adminCreateBillboard, adminUpdateBillboard, adminDeleteBillboard } from '../../services/api';
import type { Billboard } from '../../types';

export default function AdminBillboardsScreen() {
  const navigation = useNavigation<any>();
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Billboard | null>(null);
  const [title, setTitle] = useState('');
  const [targetCity, setTargetCity] = useState('lahore');

  const fetch = () => {
    setLoading(true);
    adminGetBillboards({}).then(setBillboards).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!title.trim()) { alert('Title is required'); return; }
    try {
      const payload = { title, target_city: targetCity, start_time: Math.floor(Date.now() / 1000), end_time: Math.floor(Date.now() / 1000) + 86400 };
      if (editing) {
        await adminUpdateBillboard(editing.id, payload);
      } else {
        await adminCreateBillboard(payload);
      }
      setShowForm(false);
      setEditing(null);
      setTitle('');
      fetch();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Delete this billboard?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminDeleteBillboard(id); fetch(); } catch (err: any) { alert(err.message); }
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Billboards</Text>
        <TouchableOpacity onPress={() => { setEditing(null); setTitle(''); setShowForm(true); }} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color="#E43414" size="large" style={{ marginTop: 40 }} />
        ) : (
          billboards.map((b) => (
            <View key={b.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{b.title}</Text>
                <Text style={styles.cardMeta}>{b.target_city} &middot; {new Date(b.start_time * 1000).toLocaleDateString()}</Text>
              </View>
              <View style={styles.statusDot} />
              <TouchableOpacity onPress={() => handleDelete(b.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {showForm && (
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Title" placeholderTextColor="rgba(255,255,255,0.3)" value={title} onChangeText={setTitle} />
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>{editing ? 'Update' : 'Create'}</Text>
            </TouchableOpacity>
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
  title: { flex: 1, fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E43414', justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  cardMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginHorizontal: 12 },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.15)', justifyContent: 'center', alignItems: 'center' },
  form: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginTop: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, fontSize: 14, color: '#FFFFFF', marginBottom: 12 },
  saveBtn: { backgroundColor: '#E43414', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
