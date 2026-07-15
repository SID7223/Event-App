import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Conversation } from '../../types';
import { getConversations, createConversation } from '../../services/api';
import CachedImage from '../../components/ui/CachedImage';
import { fonts } from '../../theme/fonts';

const DMListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getDisplayName = (conv: Conversation) => {
    if (conv.title) return conv.title;
    return conv.participants
      .filter(p => p.user.id !== 'me')
      .map(p => `${p.user.firstName} ${p.user.lastName}`)
      .join(', ');
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversation}
      onPress={() => navigation.navigate('DMChat', { conversationId: item.id, title: getDisplayName(item) })}
    >
      <View style={styles.avatarWrap}>
        {item.type === 'direct' && item.participants[0] ? (
          <CachedImage uri={item.participants[0].user.avatar} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.groupAvatar]}>
            <Ionicons name="people" size={22} color="#FFF" />
          </View>
        )}
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.conversationContent}>
        <Text style={styles.conversationName} numberOfLines={1}>{getDisplayName(item)}</Text>
        <Text style={styles.conversationPreview} numberOfLines={2}>{item.lastMessagePreview || 'No messages yet'}</Text>
      </View>
      <View style={styles.conversationMeta}>
        <Text style={styles.timeText}>{formatTime(item.lastMessageAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate('FriendPicker')}
        >
          <Ionicons name="create-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={conversations.length === 0 ? styles.emptyWrap : undefined}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={60} color="#444" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>Start a conversation with a friend</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerTitle: { fontSize: 28, fontFamily: fonts.sans.bold, color: '#FFF' },
  newBtn: { padding: 6 },
  conversation: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#222',
  },
  avatarWrap: { position: 'relative', marginRight: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#222' },
  groupAvatar: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#333' },
  unreadBadge: {
    position: 'absolute', top: -2, right: -2, backgroundColor: '#8B5CF6', borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  unreadText: { fontSize: 10, fontFamily: fonts.sans.bold, color: '#FFF' },
  conversationContent: { flex: 1, marginRight: 8 },
  conversationName: { fontSize: 16, fontFamily: fonts.sans.bold, color: '#FFF', marginBottom: 2 },
  conversationPreview: { fontSize: 14, fontFamily: fonts.sans.regular, color: '#888' },
  conversationMeta: { alignItems: 'flex-end' },
  timeText: { fontSize: 12, fontFamily: fonts.sans.regular, color: '#666' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontFamily: fonts.sans.bold, color: '#666', marginTop: 16 },
  emptyText: { fontSize: 14, fontFamily: fonts.sans.regular, color: '#444', marginTop: 6 },
});

export default DMListScreen;
