import React, { useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryChipProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress: (event: GestureResponderEvent) => void;
  color?: string;
  small?: boolean;
  style?: any;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  icon,
  selected = false,
  onPress,
  color = '#3DE2D1',
  small = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
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

  const containerStyle: ViewStyle = selected
    ? {
        backgroundColor: `${color}33`,
        borderColor: color,
      }
    : {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.08)',
      };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.chip, small && styles.chipSmall, containerStyle, style]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={small ? 14 : 16}
            color={selected ? color : 'rgba(255,255,255,0.5)'}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.label,
            small && styles.labelSmall,
            selected
              ? { color }
              : { color: 'rgba(255,255,255,0.7)' },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSmall: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 12,
  },
});

export default CategoryChip;
