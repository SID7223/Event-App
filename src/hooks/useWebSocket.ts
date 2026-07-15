import { useRef, useEffect, useCallback, useState } from 'react';
import { useAuth } from '../store';
import { API_BASE_URL } from '../constants/config';

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];
const MAX_RECONNECT_ATTEMPTS = 6;
const SLEEP_DURATION = 60000;

type MessageHandler = (type: string, payload: any) => void;

interface UseWebSocketOptions {
  onMessage?: MessageHandler;
  debug?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onMessage, debug } = options;
  const { authToken, user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepUntilRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef<MessageHandler | undefined>(onMessage);
  handlersRef.current = onMessage;
  const sendQueueRef = useRef<Array<{ type: string; payload?: Record<string, unknown> }>>([]);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!authToken || !user?.id) return;
    if (Date.now() < sleepUntilRef.current) {
      const wait = sleepUntilRef.current - Date.now();
      if (debug) console.log(`[WS] Sleeping for ${wait}ms`);
      reconnectTimerRef.current = setTimeout(connect, Math.min(wait, SLEEP_DURATION));
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
      const ws = new WebSocket(`${wsUrl}/ws?userId=${user.id}&token=${authToken}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (debug) console.log('[WS] Connected');
        setIsConnected(true);
        reconnectAttemptRef.current = 0;
        sleepUntilRef.current = 0;

        // Flush queued messages
        const queue = sendQueueRef.current;
        sendQueueRef.current = [];
        for (const msg of queue) {
          ws.send(JSON.stringify(msg));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { type, payload } = data;
          if (debug) console.log('[WS] Message:', type, payload);

          if (type === 'sleep') {
            sleepUntilRef.current = Date.now() + SLEEP_DURATION;
            ws.close();
            return;
          }

          if (type === 'connected') {
            return;
          }

          handlersRef.current?.(type, payload);
        } catch {}
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        if (!mountedRef.current) return;
        if (Date.now() < sleepUntilRef.current) {
          const wait = sleepUntilRef.current - Date.now();
          reconnectTimerRef.current = setTimeout(connect, Math.min(wait, SLEEP_DURATION));
          return;
        }

        if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAYS[reconnectAttemptRef.current] || 30000;
          if (debug) console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current + 1})`);
          reconnectTimerRef.current = setTimeout(connect, delay);
          reconnectAttemptRef.current++;
        } else {
          // Permanent fallback - wait 60s before retrying
          reconnectTimerRef.current = setTimeout(connect, 60000);
          reconnectAttemptRef.current = 0;
        }
      };

      ws.onerror = () => {
        // onclose will handle reconnection
      };
    } catch (e) {
      if (debug) console.error('[WS] Connection error:', e);
      reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAYS[0]);
    }
  }, [authToken, user?.id, debug]);

  const disconnect = useCallback(() => {
    mountedRef.current = false;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const send = useCallback((type: string, payload?: Record<string, unknown>) => {
    const msg = JSON.stringify({ type, payload: payload || {} });
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
    } else {
      sendQueueRef.current.push({ type, payload });
      // Attempt connection if not already connecting
      connect();
    }
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { disconnect(); };
  }, [disconnect]);

  useEffect(() => {
    if (authToken && user?.id) {
      connect();
    } else {
      disconnect();
    }
    return () => {};
  }, [authToken, user?.id, connect, disconnect]);

  return { isConnected, connect, disconnect, send };
}
