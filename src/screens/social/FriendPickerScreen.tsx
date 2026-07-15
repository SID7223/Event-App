import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store';
import { createConversation, searchUsers } from '../../services/api';
import CachedImage from '../../components/ui/CachedImage';
import { fonts } from '../../theme/fonts';

const FriendPickerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { friendsList } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await searchUsers('', 100);
        setFriends(data.filter((f: any) => friendsList.includes(f.id)));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreate = async () => {
    if (selected.length === 0 || creating) return;
    setCreating(true);
    try {
      const conv = await createConversation(selected, undefined);
      if (conv.existing) {
        navigation.replace('DMChat', { conversationId: conv.id, title: '' });
      } else {
        navigation.replace('DMChat', { conversationId: conv.id, title: '' });
      }
    } catch (_) {}
    setCreating(false);
  };

  const renderFriend = ({ item }: { item: any }) => {
    const isSelected = selected.includes(item.id);
    return (
      <TouchableOpacity style={styles.friendRow} onPress={() => toggle(item.id)}>
        <CachedImage uri={item.avatar} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.friendName}>{item.name}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Message</Text>
        <TouchableOpacity
          style={[styles.doneBtn, (selected.length === 0 || creating) && styles.doneBtnDisabled]}
          onPress={handleCreate}
          disabled={selected.length === 0 || creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.doneText}>Start</Text>
          )}
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="people-outline" size={50} color="#444" />
              <Text style={{ color: '#666', fontSize: 16, fontFamily: fonts.sans.regular, marginTop: 12 }}>No friends to message</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#222',
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontFamily: fonts.sans.bold, color: '#FFF' },
  doneBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#8B5CF6' },
  doneBtnDisabled: { opacity: 0.4 },
  doneText: { fontSize: 14, fontFamily: fonts.sans.bold, color: '#FFF' },
  friendRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#222' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', marginRight: 12 },
  friendName: { fontSize: 16, fontFamily: fonts.sans.regular, color: '#FFF' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#555', alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { borderColor: '#8B5CF6', backgroundColor: '#8B5CF6' },
});

export default FriendPickerScreen;
