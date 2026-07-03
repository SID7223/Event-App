import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface MatteGlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

const MatteGlassCard: React.FC<MatteGlassCardProps> = ({
  children,
  style,
  padding = 16,
}) => {
  return (
    <View style={[styles.borderWrapper, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderGradient}
      >
        <BlurView intensity={50} tint="dark" style={styles.blurSurface}>
          <LinearGradient
            colors={['rgba(255,122,0,0.05)', 'rgba(255,100,0,0.03)', 'rgba(20,18,16,0.5)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.orangeGlow}
          />
          <View style={[styles.content, { padding }]}>
            {children}
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  borderWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  borderGradient: {
    borderRadius: 20,
    padding: 1,
  },
  blurSurface: {
    borderRadius: 19,
    backgroundColor: 'rgba(20,18,16,0.6)',
    overflow: 'hidden',
  },
  orangeGlow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 19,
  },
  content: {},
});

export default MatteGlassCard;
