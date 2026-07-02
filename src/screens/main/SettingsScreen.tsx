import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store';
import MatteGlassCard from '../../components/ui/MatteGlassCard';
import GlassToggle from '../../components/ui/GlassToggle';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { logout, privacySettings, updatePrivacySettings } = useAuth();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [showInterested, setShowInterested] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const CustomSwitch = ({
    value,
    onValueChange,
  }: {
    value: boolean;
    onValueChange: (v: boolean) => void;
  }) => (
    <GlassToggle value={value} onValueChange={onValueChange} />
  );

  const handleLogout = () => {
    if (logout) logout();
  };

  const renderNavRow = (label: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
    </TouchableOpacity>
  );

  const renderToggleRow = (
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    value: boolean,
    onValueChange: (v: boolean) => void,
    last?: boolean
  ) => (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={19} color="rgba(255,255,255,0.6)" style={styles.rowIcon} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <CustomSwitch value={value} onValueChange={onValueChange} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Account Section */}
        <Text style={styles.sectionLabel}>Account</Text>
        <MatteGlassCard style={styles.card} padding={0}>
          <TouchableOpacity
            style={[styles.row, styles.rowBorder]}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.row, styles.rowBorder]}
            onPress={() => Alert.alert('Change Password', 'A password reset link has been sent to your email.')}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert('Privacy Settings', 'Privacy settings saved.')}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>Privacy Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        </MatteGlassCard>

        {/* Preferences Section */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <MatteGlassCard style={styles.card} padding={0}>
          {renderToggleRow('Push Notifications', 'notifications-outline', pushNotifs, setPushNotifs)}
          {renderToggleRow('Email Notifications', 'mail-outline', emailNotifs, setEmailNotifs)}
          {renderToggleRow('Location Tracking', 'location-outline', locationTracking, setLocationTracking)}
          {renderToggleRow('Show Events I\'m Interested In', 'eye-outline', showInterested, setShowInterested)}
          {renderToggleRow('Dark Mode', 'moon-outline', darkMode, setDarkMode, true)}
        </MatteGlassCard>

        {/* Privacy Section */}
        <Text style={styles.sectionLabel}>Privacy</Text>
        <MatteGlassCard style={styles.card} padding={0}>
          {renderToggleRow(
            'Hide my RSVPs from friends',
            'eye-off-outline',
            privacySettings.hideRSVPs,
            (v) => updatePrivacySettings('hideRSVPs', v),
            true
          )}
        </MatteGlassCard>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
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
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    borderRadius: 18,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    height: 58,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  logoutBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(228,52,20,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(228,52,20,0.3)',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E43414',
  },
});

export default SettingsScreen;
