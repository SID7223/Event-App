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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

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
  sm: { height: 44, fontSize: 14, paddingH: 16 },
  md: { height: 52, fontSize: 16, paddingH: 20 },
  lg: { height: 58, fontSize: 17, paddingH: 24 },
};

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
    <LinearGradient
      colors={['#3DE2D1', '#FF5A3C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradient, { height: sizeConfig.height, borderRadius: 16 }]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={sizeConfig.fontSize} color="#fff" style={styles.icon} />}
          <Text style={[styles.text, { fontSize: sizeConfig.fontSize }]}>{title}</Text>
        </View>
      )}
    </LinearGradient>
  );

  const renderSecondary = () => (
    <View
      style={[
        styles.secondaryContainer,
        {
          height: sizeConfig.height,
          borderRadius: 16,
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderColor: 'rgba(255,255,255,0.12)',
        },
      ]}
    >
      <BlurView intensity={20} tint="dark" style={styles.blurView}>
        <View style={[styles.row, { paddingHorizontal: sizeConfig.paddingH }]}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon && (
                <Ionicons name={icon} size={sizeConfig.fontSize} color="#fff" style={styles.icon} />
              )}
              <Text style={[styles.text, { fontSize: sizeConfig.fontSize }]}>{title}</Text>
            </>
          )}
        </View>
      </BlurView>
    </View>
  );

  const renderOutline = () => (
    <View style={[styles.outlineContainer, { height: sizeConfig.height, borderRadius: 16 }]}>
      <LinearGradient
        colors={['rgba(61,226,209,0.3)', 'rgba(255,90,60,0.3)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.outlineBorder, { borderRadius: 16 }]}
      >
        <View
          style={[
            styles.outlineInner,
            { height: sizeConfig.height - 2, borderRadius: 15, paddingHorizontal: sizeConfig.paddingH },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#3DE2D1" size="small" />
          ) : (
            <>
              {icon && (
                <Ionicons name={icon} size={sizeConfig.fontSize} color="#3DE2D1" style={styles.icon} />
              )}
              <LinearGradient
                colors={['#3DE2D1', '#FF5A3C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.textGradient}
              >
                <Text style={[styles.textGradientInner, { fontSize: sizeConfig.fontSize }]}>{title}</Text>
              </LinearGradient>
            </>
          )}
        </View>
      </LinearGradient>
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
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  secondaryContainer: {
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
  },
  outlineContainer: {
    overflow: 'hidden',
  },
  outlineBorder: {
    padding: 1,
  },
  outlineInner: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  icon: {
    marginRight: 8,
  },
  textGradient: {},
  textGradientInner: {
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#3DE2D1',
  },
});

export default GradientButton;
