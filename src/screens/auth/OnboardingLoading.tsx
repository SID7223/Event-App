import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Canvas, Path, Skia, BlurMask } from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { fonts } from '../../theme/fonts';

const { width: SCREEN_W } = Dimensions.get('window');
const LOGO_SIZE = SCREEN_W * 0.3;
const CANVAS_SIZE = LOGO_SIZE + 80;
const CENTER = CANVAS_SIZE / 2;
const RING_RADIUS = (LOGO_SIZE + 48) / 2 - 6;

const PHASE_1_DURATION = 8000;
const PHASE_2_DURATION = 4000;
const FADE_DURATION = 300;

const OnboardingLoading = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user, location, preferences } = route.params;

  const progress = useSharedValue(0);
  const glowOpacity = useSharedValue(0.8);
  const logoScale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  const [textIndex, setTextIndex] = useState(0);
  const texts = [
    "We're setting up your account...",
    "We're nearly there...",
  ];

  const navigateAway = useCallback(() => {
    navigation.replace('AppGuide', { user, location, preferences });
  }, [user, location, preferences, navigation]);

  const switchText = useCallback(() => {
    setTextIndex(1);
  }, []);

  const ringPath = useMemo(() => {
    const path = Skia.Path.Make();
    path.addCircle(CENTER, CENTER, RING_RADIUS);
    return path;
  }, []);

  useEffect(() => {
    progress.value = 0;

    // Phase 1: 0→80% over 8s (linear)
    progress.value = withTiming(
      0.8,
      { duration: PHASE_1_DURATION, easing: Easing.linear },
      (finished) => {
        if (finished) {
          runOnJS(switchText)();

          // Phase 2: 80%→100% over 4s (decelerate)
          progress.value = withTiming(
            1,
            { duration: PHASE_2_DURATION, easing: Easing.out(Easing.ease) },
            (f) => {
              if (f) {
                screenOpacity.value = withDelay(
                  200,
                  withTiming(0, { duration: FADE_DURATION }, (fadeFinished) => {
                    if (fadeFinished) runOnJS(navigateAway)();
                  })
                );
              }
            }
          );
        }
      }
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const progressEnd = useDerivedValue(() => {
    return interpolate(progress.value, [0, 1], [0, 1]);
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safe}>
        {/* Dynamic text */}
        <Animated.View style={styles.textWrap}>
          <Animated.Text style={styles.loadingText}>
            {texts[textIndex]}
          </Animated.Text>
        </Animated.View>

        {/* Center ring + logo */}
        <View style={styles.center}>
          {/* Outer magical glow — Android shadow fallback */}
          <Animated.View style={[styles.glowOuter, glowStyle]} />
          <Animated.View style={[styles.glowMid, glowStyle]} />

          {/* Skia Canvas — 3-layer magical glow ring */}
          <Animated.View style={[styles.canvasWrap, rotationStyle]}>
            <Canvas style={styles.canvas}>
              {/* Layer 1: Deep Ambient Bloom */}
              <Path
                path={ringPath}
                color="rgba(255, 255, 255, 0.12)"
                style="stroke"
                strokeWidth={6}
                start={0}
                end={progressEnd}
                strokeCap="round"
              >
                <BlurMask blur={30} style="normal" />
              </Path>

              {/* Layer 2: Intense Inner Glow */}
              <Path
                path={ringPath}
                color="rgba(255, 255, 255, 0.55)"
                style="stroke"
                strokeWidth={4}
                start={0}
                end={progressEnd}
                strokeCap="round"
              >
                <BlurMask blur={8} style="normal" />
              </Path>

              {/* Layer 3: Sharp Core Ring */}
              <Path
                path={ringPath}
                color="#FFFFFF"
                style="stroke"
                strokeWidth={2}
                start={0}
                end={progressEnd}
                strokeCap="round"
              />
            </Canvas>
          </Animated.View>

          {/* Logo */}
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <Image
              source={require('../../../assets/onboarding-icon.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  safe: { flex: 1 },
  textWrap: {
    position: 'absolute',
    top: '18%',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.bodyBold,
    textAlign: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  canvasWrap: {
    position: 'absolute',
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  canvas: {
    flex: 1,
  },
  glowOuter: {
    position: 'absolute',
    width: CANVAS_SIZE + 70,
    height: CANVAS_SIZE + 70,
    borderRadius: (CANVAS_SIZE + 70) / 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 55,
  },
  glowMid: {
    position: 'absolute',
    width: CANVAS_SIZE + 30,
    height: CANVAS_SIZE + 30,
    borderRadius: (CANVAS_SIZE + 30) / 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
  logoWrap: {
    position: 'absolute',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});

export default OnboardingLoading;
