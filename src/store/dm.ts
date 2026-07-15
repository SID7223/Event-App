import { create } from 'zustand';
import { Conversation } from '../types';

interface DMState {
  conversations: Conversation[];
  unreadCount: number;
  loading: boolean;
  setConversations: (convs: Conversation[]) => void;
  setUnreadCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  incrementUnread: (by?: number) => void;
  clearUnread: (conversationId: string) => void;
}

export const useDM = create<DMState>((set, get) => ({
  conversations: [],
  unreadCount: 0,
  loading: false,

  setConversations: (conversations) => {
    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
    set({ conversations, unreadCount: totalUnread });
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  setLoading: (loading) => set({ loading }),

  incrementUnread: (by = 1) => set({ unreadCount: get().unreadCount + by }),

  clearUnread: (conversationId) => {
    const convs = get().conversations.map(c =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    );
    const totalUnread = convs.reduce((sum, c) => sum + c.unreadCount, 0);
    set({ conversations: convs, unreadCount: totalUnread });
  },
}));
