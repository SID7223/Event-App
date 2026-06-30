import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';

interface AnimatedHamburgerProps {
  isOpen: boolean;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}

const AnimatedHamburger: React.FC<AnimatedHamburgerProps> = ({
  isOpen,
  onPress,
  color = '#FFFFFF',
  style,
}) => {
  const animation = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeOut, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeIn, { toValue: 1, duration: 150, delay: 150, useNativeDriver: true }),
        Animated.timing(animation, { toValue: 1, duration: 300, useNativeDriver: false }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeOut, { toValue: 1, duration: 150, delay: 150, useNativeDriver: true }),
        Animated.timing(fadeIn, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(animation, { toValue: 0, duration: 300, useNativeDriver: false }),
      ]).start();
    }
  }, [isOpen]);

  // Stairs animated widths
  const topWidth = animation.interpolate({ inputRange: [0, 1], outputRange: [20, 10] });
  const midWidth = animation.interpolate({ inputRange: [0, 1], outputRange: [20, 14] });
  const botWidth = animation.interpolate({ inputRange: [0, 1], outputRange: [20, 18] });
  const midTX = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });
  const topTX = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.touchArea, style]}>
      {/* Fries: three lines of different lengths */}
      <Animated.View style={[styles.iconGroup, { opacity: fadeOut }]}>
        <View style={[styles.line, { width: 20, backgroundColor: color }]} />
        <View style={[styles.line, { width: 14, backgroundColor: color }]} />
        <View style={[styles.line, { width: 8, backgroundColor: color }]} />
      </Animated.View>

      {/* Stairs: staggered lines */}
      <Animated.View style={[styles.iconGroup, styles.absolute, { opacity: fadeIn }]}>
        <Animated.View style={[styles.line, { width: topWidth, backgroundColor: color, transform: [{ translateX: topTX }] }]} />
        <Animated.View style={[styles.line, { width: midWidth, backgroundColor: color, transform: [{ translateX: midTX }] }]} />
        <Animated.View style={[styles.line, { width: botWidth, backgroundColor: color }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchArea: {
    padding: 4,
  },
  iconGroup: {
    gap: 4,
  },
  absolute: {
    position: 'absolute',
    left: 4,
    top: 4,
    gap: 4,
  },
  line: {
    height: 2.5,
    borderRadius: 2,
  },
});

export default AnimatedHamburger;
