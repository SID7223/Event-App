import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface Tab {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
}

interface GlassNavbarProps {
  tabs: Tab[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

const GlassNavbar: React.FC<GlassNavbarProps> = ({ tabs, activeIndex, onTabPress }) => {
  const panelScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.spring(panelScale, {
      toValue: 1,
      tension: 60,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.floatingPanel, { transform: [{ scale: panelScale }] }]}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(228, 52, 20, 0.12)', 'rgba(255,107,74, 0.08)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradientOverlay}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topEdgeHighlight}
        />
        <View style={styles.tabRow}>
          {tabs.map((tab, index) => {
            const isActive = activeIndex === index;
            const iconName = isActive ? tab.icon : tab.iconOutline;
            const color = isActive ? '#FFFFFF' : 'rgba(255,255,255,0.35)';

            const handlePress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onTabPress(index);
            };

            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabItem}
                onPress={handlePress}
                activeOpacity={0.6}
              >
                {isActive && (
                  <View style={styles.activeGlow}>
                    <LinearGradient
                      colors={['rgba(228, 52, 20, 0.25)', 'rgba(228, 52, 20, 0)']}
                      style={styles.glowGradient}
                    />
                  </View>
                )}
                {tab.name === 'ProfileTab' ? (
                  <View style={[styles.avatarRing, isActive && styles.avatarRingActive]}>
                    <Image
                      source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                      style={styles.tabAvatar}
                    />
                  </View>
                ) : (
                  <Ionicons name={iconName} size={22} color={color} />
                )}
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingPanel: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    zIndex: 999,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 28,
  },
  blurContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(22, 27, 36, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 28,
  },
  topEdgeHighlight: {
    ...StyleSheet.absoluteFill,
    borderRadius: 28,
    opacity: 0.5,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activeGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E43414',
  },
  avatarRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRingActive: {
    borderColor: '#FFFFFF',
    shadowColor: '#E43414',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  tabAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
});

export default GlassNavbar;
