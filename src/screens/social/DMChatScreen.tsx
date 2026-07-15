import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Message } from '../../types';
import { markConversationRead } from '../../services/api';
import { useAuth } from '../../store';
import { useMessages } from '../../hooks/useMessages';
import { usePresence } from '../../hooks/usePresence';
import { fonts } from '../../theme/fonts';
import { getConversation } from '../../services/api';

function StatusIcon({ status }: { status: Message['status'] }) {
  switch (status) {
    case 'sending':
      return <Ionicons name="time-outline" size={12} color="#666" />;
    case 'sent':
      return <Ionicons name="checkmark" size={12} color="#666" />;
    case 'delivered':
      return <Ionicons name="checkmark-done" size={12} color="#888" />;
    case 'read':
      return <Ionicons name="checkmark-done" size={12} color="#3B82F6" />;
    case 'failed':
      return <Ionicons name="alert-circle" size={12} color="#EF4444" />;
    default:
      return null;
  }
}

const DMChatScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { conversationId, title } = route.params || {};

  const [inputText, setInputText] = useState('');
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const presence = usePresence(otherUserId);

  const {
    messages, loading, sending, sendMessage, deleteMessage, loadMore, hasMore, markDelivered, reload,
  } = useMessages(conversationId);

  // Get other participant for presence + title
  useEffect(() => {
    if (!conversationId || title) return;
    getConversation(conversationId).then(conv => {
      const other = conv.participants.find(p => p.userId !== user?.id);
      if (other) setOtherUserId(other.userId);
    }).catch(() => {});
  }, [conversationId, title, user?.id]);

  // Mark read on mount and mark delivered for incoming messages
  useEffect(() => {
    if (!conversationId) return;
    markConversationRead(conversationId).catch(() => {});
  }, [conversationId]);

  // Mark unread incoming messages as delivered
  const unreadIncoming = useMemo(() =>
    messages.filter(m => m.senderId !== user?.id && m.status === 'sent'),
  [messages, user?.id]);

  useEffect(() => {
    if (unreadIncoming.length > 0) {
      markDelivered(unreadIncoming.map(m => m.id));
    }
  }, [unreadIncoming, markDelivered]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setInputText('');
    await sendMessage(text);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) loadMore();
  };

  const handleDelete = (messageId: string) => {
    deleteMessage(messageId);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id || item.senderId === 'me';
    return (
      <TouchableOpacity
        onLongPress={() => isMe && item.status !== 'sending' && handleDelete(item.id)}
        style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}
      >
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
          {!isMe && <Text style={styles.msgSender}>{item.senderName}</Text>}
          <Text style={styles.msgText}>{item.content}</Text>
          <View style={styles.msgMeta}>
            <Text style={styles.msgTime}>{formatTime(item.createdAt)}</Text>
            {isMe && <StatusIcon status={item.status} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Chat'}</Text>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Chat'}</Text>
          <View style={styles.presenceRow}>
            <View style={[styles.presenceDot, { backgroundColor: presence.isOnline ? '#22C55E' : '#555' }]} />
            <Text style={styles.presenceText}>
              {presence.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.msgList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          onContentSizeChange={() => messages.length > 0 && flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
            </View>
          )}
        />
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message..."
            placeholderTextColor="#666"
            multiline
            maxLength={5000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#222',
  },
  backBtn: { padding: 6, marginRight: 4 },
  headerTitle: { fontSize: 18, fontFamily: fonts.sans.bold, color: '#FFF' },
  presenceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  presenceDot: { width: 6, height: 6, borderRadius: 3 },
  presenceText: { fontSize: 11, fontFamily: fonts.sans.regular, color: '#888' },
  msgList: { padding: 16, flexGrow: 1 },
  msgRow: { marginBottom: 12, flexDirection: 'row' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgBubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  msgBubbleMe: { backgroundColor: '#8B5CF6', borderBottomRightRadius: 4 },
  msgBubbleOther: { backgroundColor: '#1C1C1E', borderBottomLeftRadius: 4 },
  msgSender: { fontSize: 12, fontFamily: fonts.sans.bold, color: '#A78BFA', marginBottom: 2 },
  msgText: { fontSize: 15, fontFamily: fonts.sans.regular, color: '#FFF', lineHeight: 20 },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
  msgTime: { fontSize: 11, fontFamily: fonts.sans.regular, color: 'rgba(255,255,255,0.5)' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, fontFamily: fonts.sans.regular, color: '#666' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#222',
  },
  input: {
    flex: 1, backgroundColor: '#1C1C1E', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, fontFamily: fonts.sans.regular, color: '#FFF', maxHeight: 100, marginRight: 8,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
});

export default DMChatScreen;
