import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store';

const MENU_ITEMS = [
  { id: 'personal', label: 'Personal Information', icon: 'person-outline' as const },
  { id: 'payment', label: 'Payment Methods', icon: 'card-outline' as const },
  { id: 'preferences', label: 'My Preferences', icon: 'options-outline' as const },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' as const },
  { id: 'invite', label: 'Invite Friends', icon: 'share-social-outline' as const },
];

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const menuAnims = useRef(MENU_ITEMS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.stagger(
      70,
      menuAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const handleNavigate = (id: string) => {
    if (id === 'personal') {
      navigation.navigate('EditProfile');
    } else if (id === 'payment') {
      Alert.alert('Payment Methods', 'Manage your credit cards, GoPay, OVO, and other payment options.', [
        { text: 'Add Card', onPress: () => Alert.alert('Coming Soon', 'Card management coming soon!') },
        { text: 'OK', style: 'cancel' },
      ]);
    } else if (id === 'preferences') {
      navigation.navigate('Settings');
    } else if (id === 'help') {
      Alert.alert('Help & Support', 'Need help? Contact us at support@zyntr.com or call +62 812 3456 7890.', [
        { text: 'Email Us', onPress: () => {} },
        { text: 'Call Us', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else if (id === 'invite') {
      Share.share({
        message: 'Hey! Check out Zyntr - discover and book amazing events. Download it now!',
        title: 'Invite Friends',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Settings icon top-right only */}
      <View style={styles.topBar}>
        <View />
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar + Name */}
        <Animated.View style={[styles.profileSection, { opacity: fadeAnim }]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatar}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.handle}>@{user?.firstName?.toLowerCase()}{user?.lastName?.toLowerCase()}.events</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>08</Text>
              <Text style={styles.statLabel}>Tickets</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>
        </Animated.View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[
                styles.menuItemWrapper,
                {
                  opacity: menuAnims[index],
                  transform: [
                    {
                      translateX: menuAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [24, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => handleNavigate(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name={item.icon} size={20} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#161B24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: '#99E1D9',
  },
  editAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#99E1D9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A0C12',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  handle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#161B24',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menuSection: {
    marginHorizontal: 24,
    backgroundColor: '#161B24',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  menuItemWrapper: {},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 20,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ProfileScreen;
