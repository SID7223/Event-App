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
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, location, settings, updateSettings, logout, followedVenues, followedOrganizers } = useAuth();
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
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
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
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@zyntr.com') },
        { text: 'Call', onPress: () => Linking.openURL('tel:+6281234567890') },
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

  const CustomSwitch = ({
    value,
    onValueChange,
  }: {
    value: boolean;
    onValueChange: (v: boolean) => void;
  }) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: 'rgba(255,255,255,0.12)', true: '#99E1D9' }}
      thumbColor={value ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
      ios_backgroundColor="rgba(255,255,255,0.12)"
    />
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
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.handle}>@{user?.firstName?.toLowerCase()}{user?.lastName?.toLowerCase()}.events</Text>
        </Animated.View>

        {/* Edit Location — Prominent */}
        <TouchableOpacity
          style={styles.locationButton}
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
          <View style={styles.locationEditBadge}>
            <Ionicons name="create-outline" size={16} color="#99E1D9" />
            <Text style={styles.locationEditText}>Edit</Text>
          </View>
        </TouchableOpacity>

        {/* Settings Toggles */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
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
          </View>
        </View>

        {/* Following Entry Point */}
        <View style={styles.followingSection}>
          <TouchableOpacity
            style={styles.followingEntryRow}
            onPress={handleFollowingPress}
            activeOpacity={0.7}
          >
            <View style={styles.followingEntryLeft}>
              <View style={styles.followingEntryIcon}>
                <Ionicons name="people-outline" size={20} color="#99E1D9" />
              </View>
              <Text style={styles.followingEntryLabel}>My Network</Text>
            </View>
            <View style={styles.followingEntryRight}>
              <Text style={styles.followingEntryCount}>Following ({followingCount})</Text>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Links */}
        <View style={styles.linksSection}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.linksCard}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={handleHostEvent}
              activeOpacity={0.7}
            >
              <View style={styles.linkLeft}>
                <Ionicons name="mic-outline" size={20} color="#99E1D9" />
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
                <Ionicons name="chatbubble-outline" size={20} color="#99E1D9" />
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
                <Ionicons name="share-social-outline" size={20} color="#99E1D9" />
                <Text style={styles.linkLabel}>Invite Friends</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#E43414" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FAB - Host an Event */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleHostEvent}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#0A0C12" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  scrollContent: {
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
  },
  // Location Button — Prominent
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#161B24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(228,52,20,0.2)',
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
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationEditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(153,225,217,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  locationEditText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#99E1D9',
  },
  // Settings Section
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: '#161B24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161B24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(153,225,217,0.15)',
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
    backgroundColor: 'rgba(153,225,217,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followingEntryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  followingEntryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followingEntryCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#99E1D9',
  },
  // Links Section
  linksSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  linksCard: {
    backgroundColor: '#161B24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
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
    fontWeight: '600',
    color: '#E43414',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#99E1D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#99E1D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ProfileScreen;
