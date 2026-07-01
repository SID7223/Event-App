import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface FollowingEntity {
  id: string;
  name: string;
  avatar: string;
  type: 'venue' | 'organizer';
}

interface FollowingRowProps {
  item: FollowingEntity;
  onPress: () => void;
  onUnfollow: () => void;
}

const FollowingRow: React.FC<FollowingRowProps> = ({ item, onPress, onUnfollow }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleUnfollow = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onUnfollow();
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <Image
          source={{ uri: item.avatar }}
          style={[styles.avatar, item.type === 'venue' && styles.venueAvatar]}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.badgeRow}>
            <Ionicons
              name={item.type === 'venue' ? 'location' : 'mic'}
              size={12}
              color={item.type === 'venue' ? '#E43414' : '#99E1D9'}
            />
            <Text style={[styles.badge, item.type === 'venue' ? styles.venueBadge : styles.organizerBadge]}>
              {item.type === 'venue' ? 'Venue' : 'Organizer'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.unfollowBtn} onPress={handleUnfollow} activeOpacity={0.7}>
          <Ionicons name="heart" size={20} color="#E43414" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161B24',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  venueAvatar: {
    borderRadius: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    fontSize: 12,
    fontWeight: '500',
  },
  venueBadge: {
    color: '#E43414',
  },
  organizerBadge: {
    color: '#99E1D9',
  },
  unfollowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(228,52,20,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FollowingRow;
