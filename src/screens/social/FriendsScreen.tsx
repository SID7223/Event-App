import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  Image,
  ScrollView,
  Platform,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store';
import { fonts } from '../../theme/fonts';
import { resolveImage } from '../../utils/images';
import {
  getFriends,
  addFriend as apiAddFriend,
  removeFriend as apiRemoveFriend,
  getFriendSuggestions,
  searchUsers,
} from '../../services/api';

const FriendsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { friendsList, setFriendsList, removeFriend, addFriend } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const deleteAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const addScaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  const [friends, setFriends] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (deleteModal) {
      deleteAnim.setValue(0);
      Animated.timing(deleteAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [deleteModal]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsData, suggestionsData] = await Promise.all([
        getFriends(),
        getFriendSuggestions(10),
      ]);
      setFriends(friendsData);
      setSuggestions(suggestionsData);
      setFriendsList(friendsData.map((f: any) => f.id));
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchUsers(searchQuery, 10);
        setSearchResults(results);
      } catch (_) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const myFriends = useMemo(
    () => friends.filter((f) => friendsList.includes(f.id)),
    [friends, friendsList]
  );

  const suggestedFriends = useMemo(
    () => suggestions.filter((f) => !friendsList.includes(f.id)),
    [suggestions, friendsList]
  );

  const displayResults = searchQuery.trim() ? searchResults : suggestedFriends;

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return myFriends;
    const q = searchQuery.toLowerCase();
    return myFriends.filter(
      (f) => f.name.toLowerCase().includes(q) || f.handle?.toLowerCase().includes(q)
    );
  }, [myFriends, searchQuery]);

  const onlineCount = myFriends.filter((f) => f.isOnline).length;

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

  const handleRemoveFriend = (friend: any) => {
    setDeleteModal(friend);
  };

  const confirmRemoveFriend = async () => {
    if (deleteModal) {
      try {
        await apiRemoveFriend(deleteModal.id);
        removeFriend(deleteModal.id);
        setFriends((prev) => prev.filter((f) => f.id !== deleteModal.id));
      } catch (_) {}
      setDeleteModal(null);
    }
  };

  const handleAddFriend = async (friend: any) => {
    try {
      await apiAddFriend(friend.id);
      addFriend(friend.id);
    } catch (_) {}
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B4A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or @handle..."
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
        {searchLoading && (
          <View style={styles.searchLoading}>
            <ActivityIndicator size="small" color="#FF6B4A" />
          </View>
        )}

        {displayResults.length > 0 && (
          <View style={styles.suggestedSection}>
            <View style={[styles.sectionLabel, styles.suggestedHeader]}>
              <Ionicons name="person-add" size={16} color="#99E1D9" />
              <Text style={styles.sectionLabelText}>
                {searchQuery.trim() ? 'Search Results' : 'Suggested Friends'}
              </Text>
            </View>
            <FlatList
              data={displayResults}
              renderItem={({ item }) => {
                const isFriend = friendsList.includes(item.id);
                return (
                  <View style={styles.suggestedCard}>
                    <Image
                      source={{ uri: resolveImage(item.avatarId, item.avatar, 'thumbnail') }}
                      style={styles.suggestedAvatar}
                    />
                    <Text style={styles.suggestedName} numberOfLines={1}>
                      {item.name.split(' ')[0]}
                    </Text>
                    <Text style={styles.suggestedHandle} numberOfLines={1}>
                      {item.handle}
                    </Text>
                    {item.mutualFriends > 0 && (
                      <Text style={styles.suggestedMutual}>{item.mutualFriends} mutual</Text>
                    )}
                    <Animated.View style={{ transform: [{ scale: getAddScale(item.id) }] }}>
                      <TouchableOpacity
                        style={[styles.addBtn, isFriend && styles.addedBtn]}
                        onPress={() => !isFriend && handleAddFriend(item)}
                        onPressIn={() => !isFriend && handlePressIn(item.id)}
                        onPressOut={() => !isFriend && handlePressOut(item.id)}
                        activeOpacity={1}
                      >
                        <Ionicons
                          name={isFriend ? 'checkmark' : 'add'}
                          size={16}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                );
              }}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedCardsRow}
            />
          </View>
        )}

        {!searchQuery.trim() && suggestions.length === 0 && (
          <View style={styles.emptySuggestions}>
            <Ionicons name="people-outline" size={32} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptySuggestionsText}>
              No suggestions available
            </Text>
          </View>
        )}

        {searchQuery.trim() && !searchLoading && searchResults.length === 0 && (
          <View style={styles.emptySuggestions}>
            <Ionicons name="search-outline" size={32} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptySuggestionsText}>
              No users found
            </Text>
          </View>
        )}

        <View style={styles.friendsSection}>
          <View style={styles.friendsSectionHeader}>
            <View style={styles.sectionLabel}>
              <Ionicons name="people" size={16} color="#FF6B4A" />
              <Text style={styles.sectionLabelText}>My Friends</Text>
            </View>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDotSmall} />
              <Text style={styles.onlineBadgeText}>{onlineCount}</Text>
            </View>
          </View>

          <View style={styles.friendsList}>
            {filteredFriends.length > 0 ? (
              filteredFriends.map((item, index) => (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.friendCard,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                    index < filteredFriends.length - 1 && styles.friendCardSpacing,
                  ]}
                >
                  <View style={styles.friendLeft}>
                    <View style={styles.avatarContainer}>
                      <Image
                        source={{ uri: resolveImage(item.avatarId, item.avatar, 'thumbnail') }}
                        style={styles.friendAvatar}
                      />
                      {item.isOnline && <View style={styles.onlineDot} />}
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{item.name}</Text>
                      <Text style={styles.friendHandle}>{item.handle}</Text>
                      {item.mutualFriends > 0 && (
                        <Text style={styles.mutualText}>{item.mutualFriends} mutual friends</Text>
                      )}
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
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Add friends from suggestions above'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={deleteModal !== null}
        transparent
        animationType="none"
        onRequestClose={() => setDeleteModal(null)}
      >
        <Pressable style={styles.deleteOverlay} onPress={() => setDeleteModal(null)}>
          <Animated.View
            style={[
              styles.deletePopup,
              {
                opacity: deleteAnim,
                transform: [
                  {
                    scale: deleteAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.deleteIconContainer}>
              <Ionicons name="person-remove" size={28} color="#EF4444" />
            </View>
            <Text style={styles.deleteTitle}>Remove Friend</Text>
            <Text style={styles.deleteMessage}>
              Remove{' '}
              <Text style={styles.deleteName}>{deleteModal?.name}</Text> from your friends?
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setDeleteModal(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={confirmRemoveFriend}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteConfirmText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchLoading: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  emptySuggestions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
  },
  emptySuggestionsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: fonts.body,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },

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

  suggestedSection: {
    marginBottom: 16,
    paddingLeft: 24,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestedHeader: {
    marginBottom: 10,
  },
  sectionLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.subheading,
  },
  suggestedCardsRow: {
    paddingRight: 20,
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
    marginBottom: 4,
    fontFamily: fonts.body,
  },
  suggestedMutual: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 6,
    fontFamily: fonts.body,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addedBtn: {
    backgroundColor: '#22C55E',
  },

  friendsSection: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
  },
  friendsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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

  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletePopup: {
    width: '80%',
    backgroundColor: '#1A1D24',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  deleteIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239,68,68,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteName: {
    color: '#FF6B4A',
    fontFamily: fonts.bodyBold,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteCancelText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.bodyBold,
  },
  deleteConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteConfirmText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EF4444',
    fontFamily: fonts.bodyBold,
  },

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