import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '../store';
import { Message } from '../types';
import { getMessages, sendMessage as apiSendMessage, editMessage, deleteMessage } from '../services/api';

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleWSMessage = useCallback((type: string, payload: any) => {
    if (!conversationId) return;

    switch (type) {
      case 'new_message': {
        const msg: Message = {
          id: payload.id,
          conversationId: payload.conversationId,
          senderId: payload.senderId,
          senderName: payload.senderName || '',
          type: payload.type || 'text',
          content: payload.content || '',
          mediaUrl: payload.mediaUrl || null,
          replyToId: payload.replyToId || null,
          status: payload.status || 'sent',
          createdAt: payload.createdAt || new Date().toISOString(),
        };

        // Only add if for this conversation and not from self (already optimistically added)
        if (msg.conversationId === conversationId && msg.senderId !== user?.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
        break;
      }

      case 'messages_delivered': {
        const deliveredIds = payload?.messageIds as string[] | undefined;
        if (deliveredIds && payload?.conversationId === conversationId) {
          setMessages(prev => prev.map(m =>
            deliveredIds.includes(m.id) ? { ...m, status: 'delivered' as const } : m
          ));
        }
        break;
      }

      case 'read_receipt': {
        if (payload?.conversationId === conversationId) {
          setMessages(prev => prev.map(m =>
            m.senderId === user?.id && m.status !== 'read'
              ? { ...m, status: 'read' as const }
              : m
          ));
        }
        break;
      }
    }
  }, [conversationId, user?.id]);

  const { send } = useWebSocket({ onMessage: handleWSMessage });

  // Subscribe/unsubscribe to conversations via WS
  useEffect(() => {
    if (!conversationId) return;
    send('subscribe_conversation', { conversationId });
    return () => send('unsubscribe_conversation', { conversationId });
  }, [conversationId, send]);

  // Load messages
  const loadMessages = useCallback(async (cursor?: string) => {
    if (!conversationId) return;
    try {
      const res = await getMessages(conversationId, cursor ? { cursor, limit: 30 } : { limit: 30 });
      if (cursor) {
        setMessages(prev => [...res.messages, ...prev]);
      } else {
        setMessages(res.messages);
      }
      setNextCursor(res.nextCursor);
    } catch {}
    setLoading(false);
    setLoadingMore(false);
  }, [conversationId]);

  useEffect(() => {
    setMessages([]);
    setLoading(true);
    setNextCursor(null);
    loadMessages();
  }, [conversationId, loadMessages]);

  const handleSend = useCallback(async (content: string, type: string = 'text', replyToId?: string) => {
    if (!conversationId || !content.trim() || sending) return;

    const text = content.trim();
    setSending(true);

    // Optimistic message
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const optimistic: Message = {
      id: tempId,
      conversationId,
      senderId: user?.id || '',
      senderName: '',
      type: type as any,
      content: text,
      mediaUrl: null,
      replyToId: replyToId || null,
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimistic]);

    try {
      const sent = await apiSendMessage(conversationId, { content: text, type, replyToId });

      // Replace optimistic with server message
      setMessages(prev => prev.map(m =>
        m.id === tempId
          ? { ...sent, status: 'sent' as const }
          : m
      ));
    } catch {
      // Mark as failed
      setMessages(prev => prev.map(m =>
        m.id === tempId ? { ...m, status: 'failed' as const } : m
      ));
    }
    setSending(false);
  }, [conversationId, user?.id, sending]);

  const handleEdit = useCallback(async (messageId: string, content: string) => {
    try {
      await editMessage(messageId, content);
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, content } : m
      ));
    } catch {}
  }, []);

  const handleDelete = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch {}
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !nextCursor) return;
    setLoadingMore(true);
    await loadMessages(nextCursor);
  }, [loadingMore, nextCursor, loadMessages]);

  const markDelivered = useCallback((messageIds: string[]) => {
    if (!conversationId || messageIds.length === 0) return;
    send('mark_delivered', { conversationId, messageIds });
  }, [conversationId, send]);

  return {
    messages,
    loading,
    sending,
    loadingMore,
    nextCursor,
    hasMore: !!nextCursor,
    sendMessage: handleSend,
    editMessage: handleEdit,
    deleteMessage: handleDelete,
    loadMore: handleLoadMore,
    markDelivered,
    reload: () => { setLoading(true); loadMessages(); },
  };
}
