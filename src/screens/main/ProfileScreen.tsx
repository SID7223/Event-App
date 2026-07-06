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
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../store';
import GlassToggle from '../../components/ui/GlassToggle';
import { fonts } from '../../theme/fonts';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, location, settings, updateSettings, logout, followedVenues, followedOrganizers, friendsList } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const followingCount = followedVenues.length + followedOrganizers.length;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=evora://profile/${user?.firstName?.toLowerCase()}${user?.lastName?.toLowerCase()}`;

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
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@zyntr.com').catch(() => { }) },
        { text: 'Call', onPress: () => Linking.openURL('tel:+6281234567890').catch(() => { }) },
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
    setShowQRModal(true);
  };

  const handleCameraPress = () => {
    Alert.alert('Change Photo', 'Choose an option', [
      {
        text: 'Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photos in Settings.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            setProfileImage(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow camera access in Settings.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            setProfileImage(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handlePlanPress = () => {
    setShowPlanModal(true);
  };

  const handleDownloadQR = () => {
    Alert.alert('Download', 'QR Code saved to your photos.');
  };

  const handleShareQR = () => {
    Share.share({
      message: `Add me on Evora! ${qrCodeUrl}`,
      title: 'My QR Code',
    });
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
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.headerBell} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Header */}
        <Animated.View style={[styles.profileSection, { opacity: fadeAnim }]}>
          <View style={[styles.avatarRing, user?.plan === 'premium' && styles.avatarRingPremium]}>
            <View style={styles.avatarInner}>
              <Image
                source={{ uri: profileImage || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.avatar}
              />
            </View>
            <TouchableOpacity style={styles.cameraBtn} onPress={handleCameraPress} activeOpacity={0.7}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Card */}
        <View style={[styles.statsCard, user?.plan === 'premium' && styles.statsCardPremium]}>
          <View style={styles.statsTop}>
            <View style={styles.statsRow}>
              <View style={styles.statsUserInfo}>
                <TouchableOpacity style={styles.statsAvatar} onPress={handleQRCode} activeOpacity={0.7}>
                  <Image source={{ uri: qrCodeUrl }} style={styles.statsQrThumb} />
                </TouchableOpacity>
                <Text style={styles.statsUserName}>{user?.firstName} {user?.lastName}</Text>
              </View>
              <TouchableOpacity style={[styles.planTag, styles.planTagPremium]} onPress={handlePlanPress} activeOpacity={0.7}>
                <Text style={[styles.planTagText, styles.planTagTextPremium]}>Premium</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.statsUserHandle}>@{user?.firstName?.toLowerCase()}{user?.lastName?.toLowerCase()}.events</Text>
          </View>

          <View style={styles.statsDivider} />

          <View style={styles.statsNumbersRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statVerticalDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{friendsList.length}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
            <View style={styles.statVerticalDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followedVenues.length + followedOrganizers.length}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editProfileBtn} onPress={handleEditProfile} activeOpacity={0.7}>
          <Ionicons name="create-outline" size={18} color="#FF6B4A" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Menu Card */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={handleEditLocation} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(228,52,20,0.12)' }]}>
                <Ionicons name="location" size={20} color="#E43414" />
              </View>
              <Text style={styles.menuLabel}>Location</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={handleFollowingPress} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,107,74,0.12)' }]}>
                <Ionicons name="people-outline" size={20} color="#FF6B4A" />
              </View>
              <Text style={styles.menuLabel}>My Network</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={handleFriendsPress} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(228,52,20,0.12)' }]}>
                <Ionicons name="heart-outline" size={20} color="#E43414" />
              </View>
              <Text style={styles.menuLabel}>My Friends</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={handleHostEvent} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,107,74,0.12)' }]}>
                <Ionicons name="mic-outline" size={20} color="#FF6B4A" />
              </View>
              <Text style={styles.menuLabel}>Host an Event</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        </View>

        {/* Settings Card */}
        <View style={styles.menuCard}>
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Ionicons name="notifications-outline" size={20} color="rgba(255,255,255,0.6)" />
              </View>
              <Text style={styles.menuLabel}>Push Notifications</Text>
            </View>
            <CustomSwitch
              value={settings.pushNotifications}
              onValueChange={(v) => updateSettings('pushNotifications', v)}
            />
          </View>

          <View style={styles.menuDivider} />

          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Ionicons name="alarm-outline" size={20} color="rgba(255,255,255,0.6)" />
              </View>
              <Text style={styles.menuLabel}>Smart Reminders</Text>
            </View>
            <CustomSwitch
              value={settings.smartReminders}
              onValueChange={(v) => updateSettings('smartReminders', v)}
            />
          </View>

          <View style={styles.menuDivider} />

          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Ionicons name="moon-outline" size={20} color="rgba(255,255,255,0.6)" />
              </View>
              <Text style={styles.menuLabel}>Dark Mode</Text>
            </View>
            <CustomSwitch
              value={settings.darkMode}
              onValueChange={(v) => updateSettings('darkMode', v)}
            />
          </View>
        </View>

        {/* More Card */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={handleContactSupport} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,107,74,0.12)' }]}>
                <Ionicons name="chatbubble-outline" size={20} color="#FF6B4A" />
              </View>
              <Text style={styles.menuLabel}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuRow} onPress={handleShare} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,107,74,0.12)' }]}>
                <Ionicons name="share-social-outline" size={20} color="#FF6B4A" />
              </View>
              <Text style={styles.menuLabel}>Invite Friends</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#E43414" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* QR Code Modal */}
      <Modal visible={showQRModal} transparent animationType="fade" onRequestClose={() => setShowQRModal(false)}>
        <Pressable style={styles.qrOverlay} onPress={() => setShowQRModal(false)}>
          <Pressable style={styles.qrPopup} onPress={(e) => e.stopPropagation()}>
            <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
            <View style={styles.qrActions}>
              <TouchableOpacity style={styles.qrActionBtn} onPress={handleDownloadQR} activeOpacity={0.7}>
                <Ionicons name="download-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.qrActionBtn, styles.qrActionBtnShare]} onPress={handleShareQR} activeOpacity={0.7}>
                <Ionicons name="share-social-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Plan Modal */}
      <Modal visible={showPlanModal} transparent animationType="fade" onRequestClose={() => setShowPlanModal(false)}>
        <Pressable style={styles.planOverlay} onPress={() => setShowPlanModal(false)}>
          <Pressable style={styles.planPopup} onPress={(e) => e.stopPropagation()}>
            <View style={styles.planHeader}>
              <Ionicons name="diamond" size={28} color="#FFD700" />
              <Text style={styles.planTitle}>Premium Plan</Text>
            </View>

            <View style={styles.planFeatures}>
              <View style={styles.planFeatureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#FFD700" />
                <Text style={styles.planFeatureText}>Priority event access</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#FFD700" />
                <Text style={styles.planFeatureText}>Exclusive VIP lounges</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#FFD700" />
                <Text style={styles.planFeatureText}>No booking fees</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#FFD700" />
                <Text style={styles.planFeatureText}>Golden profile badge</Text>
              </View>

              <TouchableOpacity style={styles.pricingTag} activeOpacity={0.7} onPress={() => { }}>
                <Text style={styles.pricingCurrency}>$</Text>
                <Text style={styles.pricingAmount}>9.99</Text>
                <Text style={styles.pricingPeriod}>/month</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  headerBell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Profile Header
  profileSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255,107,74,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRingPremium: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: '#0A0C12',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B4A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A0C12',
  },
  // Stats Card
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
  },
  statsCardPremium: {
    borderColor: 'rgba(255,215,0,0.2)',
    backgroundColor: 'rgba(255,215,0,0.04)',
  },
  statsTop: {
    marginBottom: 14,
    alignSelf: 'stretch',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statsAvatar: {
    width: 28,
    height: 28,
    borderRadius: 6,
    overflow: 'hidden',
  },
  statsQrThumb: {
    width: '100%',
    height: '100%',
  },
  statsUserName: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
    lineHeight: 28,
  },
  statsUserHandle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: fonts.body,
    marginTop: 5
  },
  planTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  planTagPremium: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  planTagText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.bodyBold,
  },
  planTagTextPremium: {
    color: '#FFD700',
  },
  statsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  statsNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: fonts.body,
  },
  statVerticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  // Menu Card
  menuCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: fonts.body,
    fontWeight: '400',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 64,
  },
  // QR Modal
  qrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPopup: {
    alignItems: 'center',
  },
  qrImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
  },
  qrActions: {
    flexDirection: 'row',
    gap: 16,
  },
  qrActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,107,74,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrActionBtnShare: {
    backgroundColor: 'rgba(228,52,20,0.15)',
    borderColor: 'rgba(228,52,20,0.3)',
  },
  // Edit Profile Button
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,74,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.2)',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B4A',
    fontFamily: fonts.bodyBold,
  },
  // Plan Modal
  planOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planPopup: {
    width: '80%',
    backgroundColor: '#1A1D24',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  planFeatures: {
    gap: 12,
    marginBottom: 24,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planFeatureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.body,
  },
  pricingTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  pricingCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    fontFamily: fonts.bodyBold,
    marginRight: 2,
  },
  pricingAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFD700',
    fontFamily: fonts.heading,
  },
  pricingPeriod: {
    fontSize: 14,
    color: 'rgba(255,215,0,0.6)',
    fontFamily: fonts.body,
    marginLeft: 2,
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
