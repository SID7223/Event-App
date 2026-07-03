import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, View, StyleSheet, ViewStyle } from 'react-native';

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
    outputRange: [3, 27],
  });

  const thumbScale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.92, 1],
  });

  return (
    <Pressable onPress={() => onValueChange(!value)} style={[styles.container, style]}>
      {/* Track */}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.trackFill,
            {
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
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
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['#E43414', '#0A0A0A'],
              }),
            },
          ]}
        >
          <View style={styles.thumbHighlight} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 28,
    justifyContent: 'center',
  },
  track: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  trackFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
    backgroundColor: '#E43414',
  },
  thumbWrapper: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    elevation: 4,
    shadowColor: '#E43414',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E43414',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  thumbHighlight: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

export default GlassToggle;
