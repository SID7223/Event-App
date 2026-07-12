import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp, useAuth } from '../../store';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.78;

const MENU_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home-outline' as const },
  { id: 'explore', label: 'Explore', icon: 'search-outline' as const },
  { id: 'myevents', label: 'My Events', icon: 'calendar-outline' as const },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' as const },
  { id: 'favorites', label: 'Favorites', icon: 'heart-outline' as const },
  { id: 'settings', label: 'Settings', icon: 'settings-outline' as const },
];

const BOTTOM_ITEMS = [
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' as const },
  { id: 'logout', label: 'Logout', icon: 'log-out-outline' as const },
];

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<any>();
  const setActiveTab = useApp((s) => s.setActiveTab);
  const { user } = useAuth();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleMenuPress = (id: string) => {
    onClose();
    setTimeout(() => {
      if (id === 'home') setActiveTab('HomeTab');
      else if (id === 'explore') setActiveTab('ExploreTab');
      else if (id === 'myevents') setActiveTab('PlansTab');
      else if (id === 'notifications') navigation.navigate('Notifications');
      else if (id === 'settings') navigation.navigate('Settings');
      else if (id === 'favorites') setActiveTab('PlansTab');
    }, 200);
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sidebar panel */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.firstName || 'User'} {user?.lastName || ''}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
              activeOpacity={0.6}
            >
              <Ionicons name={item.icon} size={22} color="rgba(255,255,255,0.7)" />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom items */}
        <View style={styles.bottomSection}>
          {BOTTOM_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
              activeOpacity={0.6}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={item.id === 'logout' ? '#E43414' : 'rgba(255,255,255,0.7)'}
              />
              <Text style={[styles.menuLabel, item.id === 'logout' && styles.logoutLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#12161D',
    paddingTop: 60,
    paddingBottom: 40,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#E43414',
    marginBottom: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  menuSection: {
    flex: 1,
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  menuLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
  },
  logoutLabel: {
    color: '#E43414',
  },
});

export default Sidebar;
