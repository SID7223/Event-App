import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PriceBadgeProps {
  price: number;
  style?: ViewStyle;
}

const PriceBadge: React.FC<PriceBadgeProps> = ({ price, style }) => {
  const isFree = price === 0;

  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  if (isFree) {
    return (
      <View style={[styles.badge, styles.freeBadge, style]}>
        <Text style={[styles.text, styles.freeText]}>Free</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.paidBadgeOuter, style]}>
      <LinearGradient
        colors={['rgba(61,226,209,0.2)', 'rgba(255,90,60,0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBg}
      >
        <LinearGradient
          colors={['#3DE2D1', '#FF5A3C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.textGradient}
        >
          <Text style={[styles.text, styles.gradientText]}>
            {formatPrice(price)}
          </Text>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  freeBadge: {
    backgroundColor: 'rgba(46,213,115,0.15)',
  },
  freeText: {
    color: '#2ED573',
  },
  paidBadgeOuter: {
    padding: 0,
    overflow: 'hidden',
  },
  gradientBg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  textGradient: {},
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  gradientText: {
    color: '#3DE2D1',
  },
});

export default PriceBadge;
