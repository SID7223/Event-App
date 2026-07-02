import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../theme/fonts';

interface GradientButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const sizes = {
  sm: { height: 40, fontSize: 11, paddingH: 14 },
  md: { height: 46, fontSize: 12, paddingH: 18 },
  lg: { height: 52, fontSize: 13, paddingH: 22 },
};

const LEMON = '#FFF44F';
const DARK = '#0A0C12';

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const sizeConfig = sizes[size];

  const renderPrimary = () => (
    <View style={[styles.retroOuter, { borderColor: LEMON }]}>
      <View style={[styles.retroInner, { height: sizeConfig.height, backgroundColor: LEMON }]}>
        {loading ? (
          <ActivityIndicator color={DARK} size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <Ionicons name={icon} size={sizeConfig.fontSize} color={DARK} style={styles.icon} />}
            <Text style={[styles.text, { fontSize: sizeConfig.fontSize }]}>{title}</Text>
            <View style={styles.arrowWrap}>
              <Ionicons name="arrow-forward" size={12} color={DARK} />
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderSecondary = () => (
    <View style={[styles.retroOuter, { borderColor: 'rgba(255,255,255,0.2)' }]}>
      <View style={[styles.retroInner, { height: sizeConfig.height, backgroundColor: 'rgba(255,255,255,0.08)' }]}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <Ionicons name={icon} size={sizeConfig.fontSize} color="#fff" style={styles.icon} />}
            <Text style={[styles.textSecondary, { fontSize: sizeConfig.fontSize }]}>{title}</Text>
            <View style={[styles.arrowWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="arrow-forward" size={12} color="#fff" />
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderOutline = () => (
    <View style={[styles.retroOuter, { borderColor: LEMON }]}>
      <View style={[styles.retroInner, { height: sizeConfig.height, backgroundColor: 'transparent' }]}>
        {loading ? (
          <ActivityIndicator color={LEMON} size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <Ionicons name={icon} size={sizeConfig.fontSize} color={LEMON} style={styles.icon} />}
            <Text style={[styles.textOutline, { fontSize: sizeConfig.fontSize }]}>{title}</Text>
            <View style={[styles.arrowWrap, { borderColor: LEMON, borderWidth: 1, backgroundColor: 'transparent' }]}>
              <Ionicons name="arrow-forward" size={12} color={LEMON} />
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'secondary':
        return renderSecondary();
      case 'outline':
        return renderOutline();
      default:
        return renderPrimary();
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        style={[disabled && { opacity: 0.5 }]}
      >
        {renderVariant()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  retroOuter: {
    borderWidth: 1.5,
    borderRadius: 6,
    padding: 2,
  },
  retroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  arrowWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: DARK,
    fontWeight: '500',
    letterSpacing: 1.2,
    fontFamily: fonts.bodyBold,
    textTransform: 'uppercase',
  },
  textSecondary: {
    color: '#FFFFFF',
    fontWeight: '500',
    letterSpacing: 1.2,
    fontFamily: fonts.bodyBold,
    textTransform: 'uppercase',
  },
  textOutline: {
    color: LEMON,
    fontWeight: '500',
    letterSpacing: 1.2,
    fontFamily: fonts.bodyBold,
    textTransform: 'uppercase',
  },
  icon: {
    marginRight: 0,
  },
});

export default GradientButton;
