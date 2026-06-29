import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurType?: 'dark' | 'light';
  blurAmount?: number;
  intensity?: number;
  onPress?: (event: GestureResponderEvent) => void;
  borderRadius?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  blurType = 'dark',
  blurAmount = 20,
  intensity = 0.08,
  onPress,
  borderRadius = 24,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const backgroundColor = `rgba(255,255,255,${Math.min(intensity * 5, 0.12)})`;

  const cardStyle: ViewStyle = {
    borderRadius,
    backgroundColor,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
  };

  const content = (
    <View style={cardStyle}>
      <BlurView intensity={blurAmount} tint={blurType} style={styles.blurView}>
        <View style={[styles.content, { padding: 16 }, style]}>
          {children}
        </View>
      </BlurView>
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          style={styles.touchable}
        >
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>{content}</Animated.View>;
};

const styles = StyleSheet.create({
  blurView: {
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
  },
  touchable: {
    borderRadius: 24,
  },
});

export default GlassCard;
