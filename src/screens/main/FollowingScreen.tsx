import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store';
import GlassPill from '../../components/ui/GlassPill';
import { fonts } from '../../theme/fonts';
import { getVenueById, getOrganizerById } from '../../services/mockData';
import FollowingRow, { FollowingEntity } from '../../components/ui/FollowingRow';

type TabKey = 'all' | 'venues' | 'organizers';

const FollowingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { followedVenues, followedOrganizers, unfollowEntity } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Build unified list
  const allEntities: FollowingEntity[] = useMemo(() => {
    const venues: FollowingEntity[] = followedVenues.map(id => {
      const v = getVenueById(id);
      return v ? { id: v.id, name: v.name, avatar: v.logo, type: 'venue' as const } : null;
    }).filter(Boolean) as FollowingEntity[];

    const organizers: FollowingEntity[] = followedOrganizers.map(id => {
      const o = getOrganizerById(id);
      return o ? { id: o.id, name: o.name, avatar: o.avatar, type: 'organizer' as const } : null;
    }).filter(Boolean) as FollowingEntity[];

    return [...venues, ...organizers].sort((a, b) => a.name.localeCompare(b.name));
  }, [followedVenues, followedOrganizers]);

  const filteredEntities = useMemo(() => {
    if (activeTab === 'venues') return allEntities.filter(e => e.type === 'venue');
    if (activeTab === 'organizers') return allEntities.filter(e => e.type === 'organizer');
    return allEntities;
  }, [allEntities, activeTab]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const handleItemPress = (item: FollowingEntity) => {
    if (item.type === 'venue') {
      navigation.navigate('VenueProfile', { venueId: item.id });
    } else {
      navigation.navigate('OrganizerProfile', { organizerId: item.id });
    }
  };

  const handleUnfollow = async (item: FollowingEntity) => {
    await unfollowEntity(item.id, item.type);
  };

  const handleGoToExplore = () => {
    navigation.goBack();
    // Navigate to Explore tab
    navigation.navigate('Main', { screen: 'Explore' });
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'venues', label: 'Venues' },
    { key: 'organizers', label: 'Organizers' },
  ];

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={48} color="rgba(255,255,255,0.15)" />
      </View>
      <Text style={styles.emptyTitle}>No follows yet</Text>
      <Text style={styles.emptySubtitle}>
        You aren't following any local spots yet.{'\n'}Explore your city to find creators and venues!
      </Text>
      <TouchableOpacity style={styles.exploreBtn} onPress={handleGoToExplore} activeOpacity={0.85}>
        <Ionicons name="compass-outline" size={18} color="#000000" />
        <Text style={styles.exploreBtnText}>Explore</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Following</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerCount}>{allEntities.length}</Text>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <GlassPill
            key={tab.key}
            label={tab.label}
            active={activeTab === tab.key}
            onPress={() => handleTabChange(tab.key)}

          />
        ))}
      </View>

      {/* List */}
      <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
        {filteredEntities.length > 0 ? (
          <FlatList
            data={filteredEntities}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => (
              <FollowingRow
                item={item}
                onPress={() => handleItemPress(item)}
                onUnfollow={() => handleUnfollow(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        ) : (
          renderEmpty()
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E43414',
    fontFamily: fonts.body,
  },
  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: fonts.subheading,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: fonts.body,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B4A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    fontFamily: fonts.bodyBold,
  },
});

export default FollowingScreen;
