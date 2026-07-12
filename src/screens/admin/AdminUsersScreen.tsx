import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminGetUsers, adminUpdateUserRole } from '../../services/api';
import type { PaginatedResult, User } from '../../types';

export default function AdminUsersScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<PaginatedResult<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetch = () => {
    setLoading(true);
    adminGetUsers({ page, limit: 20, q: search || undefined })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page]);

  const handleSearch = () => { setPage(1); fetch(); };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Users</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color="#E43414" size="large" style={{ marginTop: 40 }} />
        ) : (
          data?.items.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userCard}
              onPress={() => navigation.navigate('AdminUserDetail', { userId: user.id })}
            >
              <View>
                <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? 'rgba(228,52,20,0.2)' : 'rgba(255,255,255,0.06)' }]}>
                <Text style={[styles.roleText, { color: user.role === 'admin' ? '#E43414' : 'rgba(255,255,255,0.5)' }]}>
                  {user.role || 'user'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {data && data.totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity disabled={page <= 1} onPress={() => setPage((p) => p - 1)} style={[styles.pageBtn, page <= 1 && { opacity: 0.3 }]}>
              <Text style={styles.pageBtnText}>Previous</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>{data.page} / {data.totalPages}</Text>
            <TouchableOpacity disabled={page >= data.totalPages} onPress={() => setPage((p) => p + 1)} style={[styles.pageBtn, page >= data.totalPages && { opacity: 0.3 }]}>
              <Text style={styles.pageBtnText}>Next</Text>
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
  title: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#FFFFFF' },
  scroll: { padding: 16, paddingTop: 0 },
  userCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  userName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 16 },
  pageBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)' },
  pageBtnText: { fontSize: 13, fontWeight: '500', color: '#FFFFFF' },
  pageInfo: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
});
