import { useState, useRef, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '../store';

interface PresenceState {
  isOnline: boolean;
  lastSeen: number;
}

export function usePresence(userId: string | null) {
  const [presence, setPresence] = useState<PresenceState>({ isOnline: false, lastSeen: 0 });
  const presenceMapRef = useRef<Map<string, PresenceState>>(new Map());

  const handleMessage = useCallback((type: string, payload: any) => {
    if (type === 'user_online' || type === 'user_offline') {
      const targetId = payload?.userId as string;
      const lastSeen = payload?.lastSeen as number || Date.now();
      const state: PresenceState = { isOnline: type === 'user_online', lastSeen };

      presenceMapRef.current.set(targetId, state);

      if (targetId === userId) {
        setPresence(state);
      }
    }
  }, [userId]);

  const { send } = useWebSocket({ onMessage: handleMessage });

  return presence;
}

export function usePresenceMap() {
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceState>>(new Map());
  const { user } = useAuth();

  const handleMessage = useCallback((type: string, payload: any) => {
    if (type === 'user_online' || type === 'user_offline') {
      const targetId = payload?.userId as string;
      const lastSeen = payload?.lastSeen as number || Date.now();
      setPresenceMap(prev => {
        const next = new Map(prev);
        next.set(targetId, { isOnline: type === 'user_online', lastSeen });
        return next;
      });
    }
  }, []);

  useWebSocket({ onMessage: handleMessage });

  return presenceMap;
}
