import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassToggleProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
  style?: ViewStyle;
}

const GlassToggle: React.FC<GlassToggleProps> = ({
  value,
  onValueChange,
  style,
}) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      tension: 80,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const thumbTranslateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 32],
  });

  const thumbScale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 1],
  });

  return (
    <Pressable onPress={() => onValueChange(!value)} style={[styles.container, style]}>
      {/* Track background with glassmorphism */}
      <View style={styles.track}>
        <LinearGradient
          colors={
            value
              ? ['rgba(255,107,74,0.25)', 'rgba(255,107,74,0.12)']
              : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.trackGradient}
        />
        {/* Glass highlight stripe */}
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassHighlight}
        />
      </View>

      {/* Thumb */}
      <Animated.View
        style={[
          styles.thumbWrapper,
          {
            transform: [
              { translateX: thumbTranslateX },
              { scale: thumbScale },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={
            value
              ? ['#FF8A65', '#FF6B4A']
              : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.4)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.thumb}
        >
          {/* Thumb glass highlight */}
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.thumbHighlight}
          />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 32,
    justifyContent: 'center',
  },
  track: {
    width: 60,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  trackGradient: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,
  },
  glassHighlight: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,
  },
  thumbWrapper: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#FF6B4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  thumbHighlight: {
    ...StyleSheet.absoluteFill,
    borderRadius: 12,
  },
});

export default GlassToggle;
