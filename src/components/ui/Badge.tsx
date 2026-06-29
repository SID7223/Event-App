import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface BadgeProps {
  count: number;
  color?: string;
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  count,
  color = '#FF6A3D',
  style,
}) => {
  const displayCount = count > 99 ? '99+' : String(count);
  const minWidth = count > 99 ? 26 : 18;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
          minWidth,
          borderRadius: minWidth / 2,
        },
        style,
      ]}
    >
      <Text style={styles.text}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    height: 18,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});

export default Badge;
