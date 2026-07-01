import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface GlassPillProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: number;
  compact?: boolean;
  activeTextColor?: string;
}

const GlassPill: React.FC<GlassPillProps> = ({
  label,
  active,
  onPress,
  icon,
  badge,
  compact = false,
  activeTextColor,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onPress();
  };

  const activeColor = activeTextColor || '#FFFFFF';

  const textColor = active ? activeColor : 'rgba(255,255,255,0.50)';
  const iconColor = active ? activeColor : 'rgba(255,255,255,0.50)';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      style={styles.wrapper}
    >
      <LinearGradient
        colors={active
          ? ['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.06)']
          : ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.borderGradient, compact && styles.borderCompact]}
      >
        <BlurView intensity={60} tint="dark" style={styles.blurSurface}>
          <View style={[styles.content, compact && styles.contentCompact]}>
            {icon && (
              <Ionicons name={icon} size={compact ? 13 : 15} color={iconColor} />
            )}
            <Text
              style={[
                styles.label,
                compact && styles.labelCompact,
                { color: textColor },
              ]}
            >
              {label}
            </Text>
            {badge !== undefined && badge > 0 && (
              <View style={styles.badge}>
                <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                  {badge}
                </Text>
              </View>
            )}
          </View>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
  borderGradient: {
    borderRadius: 24,
    padding: 1,
  },
  borderCompact: {
    borderRadius: 18,
  },
  blurSurface: {
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  contentCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 5,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    letterSpacing: 0.2,
  },
  labelCompact: {
    fontSize: 13,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 2,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.50)',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
});

export default GlassPill;
