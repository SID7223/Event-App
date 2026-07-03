import React, { useEffect, useRef, useState } from 'react';
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store';
import MatteGlassCard from '../../components/ui/MatteGlassCard';
import GlassToggle from '../../components/ui/GlassToggle';
import { fonts } from '../../theme/fonts';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, location, settings, updateSettings, logout, followedVenues, followedOrganizers, friendsList } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const followingCount = followedVenues.length + followedOrganizers.length;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleEditLocation = () => {
    navigation.navigate('EditProfile');
  };

  const handleHostEvent = () => {
    navigation.navigate('HostEvent');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Need help? Reach out to us.',
      [
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@zyntr.com').catch(() => {}) },
        { text: 'Call', onPress: () => Linking.openURL('tel:+6281234567890').catch(() => {}) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleShare = () => {
    Share.share({
      message: 'Hey! Check out Zyntr - discover and book amazing events. Download it now!',
      title: 'Invite Friends',
    });
  };

  const handleFollowingPress = () => {
    navigation.navigate('Following');
  };

  const handleFriendsPress = () => {
    navigation.navigate('Friends');
  };

  const handleQRCode = () => {
    Alert.alert(
      'My QR Code',
      'Show this QR code to let friends add you instantly.',
      [{ text: 'Got it' }]
    );
  };

  const CustomSwitch = ({
    value,
    onValueChange,
  }: {
    value: boolean;
    onValueChange: (v: boolean) => void;
  }) => (
    <GlassToggle value={value} onValueChange={onValueChange} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
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
          <TouchableOpacity style={styles.qrButton} onPress={handleQRCode} activeOpacity={0.7}>
            <Ionicons name="arrow-forward" size={18} color="#E43414" />
            <Text style={styles.qrButtonText}>My QR Code</Text>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.handle}>@{user?.firstName?.toLowerCase()}{user?.lastName?.toLowerCase()}.events</Text>
        </Animated.View>

        {/* Edit Location — Prominent */}
        <MatteGlassCard style={styles.locationButton}>
          <TouchableOpacity
            onPress={handleEditLocation}
            activeOpacity={0.85}
          >
            <View style={styles.locationLeft}>
              <View style={styles.locationIconContainer}>
                <Ionicons name="location" size={20} color="#E43414" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Your Location</Text>
                <Text style={styles.locationValue}>
                  {location?.neighborhood || 'Set your location'}, {location?.city || 'Jakarta'}
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#E43414" />
          </TouchableOpacity>
        </MatteGlassCard>

        {/* Settings Toggles */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <MatteGlassCard style={styles.settingsCard} padding={0}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color="rgba(255,255,255,0.6)" />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <CustomSwitch
                value={settings.pushNotifications}
                onValueChange={(v) => updateSettings('pushNotifications', v)}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="alarm-outline" size={20} color="rgba(255,255,255,0.6)" />
                <Text style={styles.settingLabel}>Smart Reminders</Text>
              </View>
              <CustomSwitch
                value={settings.smartReminders}
                onValueChange={(v) => updateSettings('smartReminders', v)}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={20} color="rgba(255,255,255,0.6)" />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <CustomSwitch
                value={settings.darkMode}
                onValueChange={(v) => updateSettings('darkMode', v)}
              />
            </View>
          </MatteGlassCard>
        </View>

        {/* Following Entry Point */}
        <View style={styles.followingSection}>
          <MatteGlassCard style={styles.followingEntryRow}>
            <TouchableOpacity
              onPress={handleFollowingPress}
              activeOpacity={0.7}
            >
              <View style={styles.followingEntryLeft}>
                <View style={styles.followingEntryIcon}>
                  <Ionicons name="people-outline" size={20} color="#FF6B4A" />
                </View>
                <Text style={styles.followingEntryLabel}>My Network</Text>
              </View>
              <View style={styles.followingEntryRight}>
                <Text style={styles.followingEntryCount}>Following ({followingCount})</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
              </View>
            </TouchableOpacity>
          </MatteGlassCard>
        </View>

        {/* Friends Section */}
        <View style={styles.friendsSection}>
          <MatteGlassCard style={styles.friendsEntryRow}>
            <TouchableOpacity
              onPress={handleFriendsPress}
              activeOpacity={0.7}
            >
              <View style={styles.friendsEntryLeft}>
                <View style={styles.friendsEntryIcon}>
                  <Ionicons name="heart-outline" size={20} color="#E43414" />
                </View>
                <View>
                  <Text style={styles.friendsEntryLabel}>My Friends</Text>
                  <Text style={styles.friendsEntryCount}>{friendsList.length} friends</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </MatteGlassCard>
        </View>

        {/* Action Links */}
        <View style={styles.linksSection}>
          <Text style={styles.sectionTitle}>More</Text>
          <MatteGlassCard style={styles.linksCard} padding={0}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={handleHostEvent}
              activeOpacity={0.7}
            >
              <View style={styles.linkLeft}>
                <Ionicons name="mic-outline" size={20} color="#FF6B4A" />
                <Text style={styles.linkLabel}>Host an Event</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
            
            <View style={styles.linkDivider} />
            
            <TouchableOpacity
              style={styles.linkRow}
              onPress={handleContactSupport}
              activeOpacity={0.7}
            >
              <View style={styles.linkLeft}>
                <Ionicons name="chatbubble-outline" size={20} color="#FF6B4A" />
                <Text style={styles.linkLabel}>Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
            
            <View style={styles.linkDivider} />
            
            <TouchableOpacity
              style={styles.linkRow}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <View style={styles.linkLeft}>
                <Ionicons name="share-social-outline" size={20} color="#FF6B4A" />
                <Text style={styles.linkLabel}>Invite Friends</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </MatteGlassCard>
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#E43414" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  // Profile Header
  profileSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
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
    borderColor: '#FF6B4A',
  },
  editAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B4A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A0C12',
  },
  name: {
    fontSize: 22,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    marginBottom: 4,
  },
  handle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: fonts.body,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,107,74,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.2)',
  },
  qrButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF6B4A',
    fontFamily: fonts.bodyBold,
  },
  // Location Button — Prominent
  locationButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(228,52,20,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
  },
  locationEditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,107,74,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  locationEditText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF6B4A',
    fontFamily: fonts.bodyBold,
  },
  // Settings Section
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    marginBottom: 12,
  },
  settingsCard: {
    borderRadius: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: fonts.body,
    fontWeight: '400',
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 48,
  },
  // Following Entry
  followingSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  followingEntryRow: {
    borderRadius: 16,
  },
  followingEntryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followingEntryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,74,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followingEntryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.subheading,
  },
  followingEntryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followingEntryCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B4A',
    fontFamily: fonts.bodyBold,
  },
  // Friends Section
  friendsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  friendsEntryRow: {
    borderRadius: 16,
  },
  friendsEntryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendsEntryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(228,52,20,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendsEntryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.subheading,
  },
  friendsEntryCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: fonts.body,
    marginTop: 2,
  },
  // Links Section
  linksSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  linksCard: {
    borderRadius: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: fonts.body,
    fontWeight: '400',
  },
  linkDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 48,
  },
  // Log Out
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(228,52,20,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(228,52,20,0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E43414',
    fontFamily: fonts.bodyBold,
  },
});

export default ProfileScreen;
