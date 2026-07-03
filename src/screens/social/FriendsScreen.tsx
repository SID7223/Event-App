import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store';
import { fonts } from '../../theme/fonts';
import { Friend } from '../../types';
import { mockFriends } from '../../services/mockData';

const FriendsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { friendsList, removeFriend, addFriend } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const addScaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const friends = useMemo(() => {
    return mockFriends.filter(f => friendsList.includes(f.id));
  }, [friendsList]);

  const suggestedUsers = useMemo(() => {
    return mockFriends.filter(f => !friendsList.includes(f.id));
  }, [friendsList]);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const q = searchQuery.toLowerCase();
    return friends.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.handle.toLowerCase().includes(q)
    );
  }, [friends, searchQuery]);

  const onlineCount = friends.filter(f => f.isOnline).length;

  const getAddScale = (id: string) => {
    if (!addScaleAnims[id]) {
      addScaleAnims[id] = new Animated.Value(1);
    }
    return addScaleAnims[id];
  };

  const handlePressIn = (id: string) => {
    Animated.spring(getAddScale(id), {
      toValue: 0.92,
      speed: 50,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (id: string) => {
    Animated.spring(getAddScale(id), {
      toValue: 1,
      speed: 20,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleRemoveFriend = (friend: Friend) => {
    Alert.alert(
      'Remove Friend',
      `Remove ${friend.name} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFriend(friend.id),
        },
      ]
    );
  };

  const handleAddFriend = (friend: Friend) => {
    addFriend(friend.id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by @handle..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Suggested Friends */}
        {suggestedUsers.length > 0 && !searchQuery && (
          <View style={styles.suggestedSection}>
            <View style={[styles.sectionLabel, styles.suggestedHeader]}>
              <Ionicons name="person-add" size={16} color="#99E1D9" />
              <Text style={styles.sectionLabelText}>Suggested Friends</Text>
            </View>
            <FlatList
              data={suggestedUsers}
              renderItem={({ item }) => (
                <View style={styles.suggestedCard}>
                  <Image source={{ uri: item.avatar }} style={styles.suggestedAvatar} />
                  <Text style={styles.suggestedName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
                  <Text style={styles.suggestedHandle} numberOfLines={1}>{item.handle}</Text>
                  <Animated.View style={{ transform: [{ scale: getAddScale(item.id) }] }}>
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => handleAddFriend(item)}
                      onPressIn={() => handlePressIn(item.id)}
                      onPressOut={() => handlePressOut(item.id)}
                      activeOpacity={1}
                    >
                      <Ionicons name="person-add-outline" size={12} color="#FFFFFF" />
                      <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedCardsRow}
            />
          </View>
        )}

        {/* My Friends */}
        <View style={styles.friendsSection}>
          <View style={styles.friendsSectionHeader}>
            <View style={styles.sectionLabel}>
              <Ionicons name="people" size={16} color="#FF6B4A" />
              <Text style={styles.sectionLabelText}>My Friends</Text>
            </View>
            <View style={styles.countsRow}>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{friends.length}</Text>
              </View>
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDotSmall} />
                <Text style={styles.onlineBadgeText}>{onlineCount} online</Text>
              </View>
            </View>
          </View>

          <View style={styles.friendsList}>
            {filteredFriends.length > 0 ? (
              filteredFriends.map((item, index) => (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.friendCard,
                    { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
                    index < filteredFriends.length - 1 && styles.friendCardSpacing,
                  ]}
                >
                  <View style={styles.friendLeft}>
                    <View style={styles.avatarContainer}>
                      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                      {item.isOnline && <View style={styles.onlineDot} />}
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{item.name}</Text>
                      <Text style={styles.friendHandle}>{item.handle}</Text>
                      <Text style={styles.mutualText}>{item.mutualFriends} mutual friends</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveFriend(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.12)" />
                <Text style={styles.emptyTitle}>
                  {searchQuery ? 'No friends found' : 'No friends yet'}
                </Text>
                <Text style={styles.emptySub}>
                  {searchQuery ? 'Try a different search term' : 'Add friends to see their activity'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },

  // Search
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 0,
    fontFamily: fonts.body,
  },

  // Suggested Friends
  suggestedSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestedHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.subheading,
  },
  suggestedCardsRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  suggestedCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    width: 100,
  },
  suggestedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 6,
  },
  suggestedName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.subheading,
    marginBottom: 2,
  },
  suggestedHandle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
    fontFamily: fonts.body,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: '#FF6B4A',
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
  },

  // My Friends
  friendsSection: {
    paddingHorizontal: 20,
  },
  friendsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  countsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(255,107,74,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF6B4A',
    fontFamily: fonts.bodyBold,
    fontVariant: ['tabular-nums'],
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  onlineDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  onlineBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22C55E',
    fontFamily: fonts.bodyBold,
    fontVariant: ['tabular-nums'],
  },
  friendsList: {
    gap: 10,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  friendCardSpacing: {
    marginBottom: 0,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: fonts.subheading,
  },
  friendHandle: {
    fontSize: 13,
    color: '#FF6B4A',
    marginBottom: 2,
    fontFamily: fonts.body,
  },
  mutualText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: fonts.body,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.subheading,
  },
  emptySub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: fonts.body,
  },
});

export default FriendsScreen;