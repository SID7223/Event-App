import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Image as RNImage,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../../store';
import MaskedView from '@react-native-masked-view/masked-view';

const PROGRESS_DURATION = 10000;
const LOGO_SIZE = 160;
const WAVE_LAYERS = 6;

// Bright → deep orange palette
const WAVE_COLORS = [
  '#FF6B4A',
  '#FF5533',
  '#E04020',
  '#C43415',
  '#A0280A',
  '#7A1E05',
];

// ─────────────────────────────────────────────────────────────────
// LogoWave — MaskedView uses onboarding-icon-mask.png (filled
// solid white pill shapes) to clip the waves to ONLY the pill
// interiors. The original PNG is overlaid on top for outlines.
// ─────────────────────────────────────────────────────────────────
const LogoWave: React.FC = () => {
  const layerAnims = useRef(
    Array.from({ length: WAVE_LAYERS }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = layerAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 140),
          Animated.timing(anim, {
            toValue: 1,
            duration: 850,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 850,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={{ width: LOGO_SIZE, height: LOGO_SIZE }}>

      {/* MaskedView: filled mask PNG clips waves to pill interiors only */}
      <MaskedView
        style={{ position: 'absolute', width: LOGO_SIZE, height: LOGO_SIZE }}
        maskElement={
          <RNImage
            source={require('../../../assets/onboarding-icon-mask.png')}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
            resizeMode="contain"
          />
        }
      >
        {/* 6 wave layers — only visible through the filled pill mask */}
        <View style={{ width: LOGO_SIZE, height: LOGO_SIZE }}>
          {layerAnims.map((anim, i) => {
            const layerH = LOGO_SIZE * (1 - i * 0.08);
            const amplitude = LOGO_SIZE * (0.16 - i * 0.015);

            const translateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [-amplitude, amplitude],
            });

            const opacity = anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.65, 1, 0.65],
            });

            return (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: (LOGO_SIZE - layerH) / 2,
                  width: LOGO_SIZE,
                  height: layerH,
                  borderRadius: layerH / 2,
                  backgroundColor: WAVE_COLORS[i],
                  opacity,
                  transform: [{ translateY }],
                }}
              />
            );
          })}
        </View>
      </MaskedView>

      {/* Original logo PNG on top — white stroke outlines frame the pills */}
      <RNImage
        source={require('../../../assets/onboarding-icon.png')}
        style={{
          position: 'absolute',
          width: LOGO_SIZE,
          height: LOGO_SIZE,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────
const OnboardingLoading = () => {
  const route = useRoute<any>();
  const { completeOnboarding } = useAuth();
  const { user, location, preferences } = route.params;

  useEffect(() => {
    const timer = setTimeout(() => {
      completeOnboarding({ user, location, preferences });
    }, PROGRESS_DURATION);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <LogoWave />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safe:      { flex: 1 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default OnboardingLoading;
