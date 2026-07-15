type PusherCallback = (data: any) => void;

interface PusherConnection {
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  bind: (event: string, callback: PusherCallback) => void;
  unbind: (event: string) => void;
  disconnect: () => void;
}

let client: PusherConnection | null = null;
const subscriptions = new Map<string, Map<string, PusherCallback>>();

function loadPusherJs(): Promise<any> {
  return import('pusher-js/react-native');
}

export async function initPusher(key: string, cluster: string, authEndpoint: string, token: string): Promise<void> {
  if (client) return;

  try {
    const PusherJS = (await loadPusherJs()).default;
    client = new PusherJS(key, {
      cluster,
      authEndpoint,
      auth: {
        headers: { Authorization: `Bearer ${token}` },
      },
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
    });

    subscriptions.forEach((events, channelName) => {
      client!.subscribe(channelName);
      events.forEach((callback, eventName) => {
        client!.bind(eventName, callback);
      });
    });
  } catch (e) {
    console.error('Pusher init failed:', e);
  }
}

export function subscribe(channel: string, event: string, callback: PusherCallback): () => void {
  if (!subscriptions.has(channel)) {
    subscriptions.set(channel, new Map());
    if (client) client.subscribe(channel);
  }

  const events = subscriptions.get(channel)!;
  events.set(event, callback);
  if (client) client.bind(event, callback);

  return () => {
    events.delete(event);
    if (events.size === 0) {
      subscriptions.delete(channel);
      if (client) {
        client.unbind(event);
        client.unsubscribe(channel);
      }
    }
  };
}

export function subscribePrivateConversation(conversationId: string, event: string, callback: PusherCallback): () => void {
  return subscribe(`private-conversation-${conversationId}`, event, callback);
}

export function disconnect(): void {
  if (client) {
    client.disconnect();
    client = null;
  }
  subscriptions.clear();
}

export function isConnected(): boolean {
  return client !== null;
}
