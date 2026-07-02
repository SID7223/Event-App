import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
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
  gradientColors?: readonly string[];
}

const GlassNavbar: React.FC<GlassNavbarProps> = ({ tabs, activeIndex, onTabPress, gradientColors }) => {
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
      <LinearGradient
        colors={gradientColors?.slice(0, 2) as [string, string] ?? ['rgba(20,18,16,0.6)', 'rgba(20,18,16,0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.blurContainer}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradientOverlay}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topEdgeHighlight}
        />
        <View style={styles.tabRow}>
          {tabs.map((tab, index) => {
            const isActive = activeIndex === index;
            const iconName = isActive ? tab.icon : tab.iconOutline;
            const color = '#FFFFFF';

            const handlePress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
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
                      colors={['rgba(228, 51, 20, 1)', 'rgba(228, 52, 20, 0)']}
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
                  <Ionicons name={iconName} size={24} color={color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 999,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.,
    shadowRadius: 32,
    elevation: 8,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
  },
  topEdgeHighlight: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    opacity: 0.5,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
  },
  activeGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  avatarRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRingActive: {
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

export default GlassNavbar;
