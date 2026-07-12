import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../theme/fonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SHADOW_ALPHA = 12;
const HIGHLIGHT_ALPHA = 0.17;
const EXPOSURE_ALPHA = 0.04;
const BLUR_RADIUS = 2;

const GrainOverlay: React.FC = () => {
  const dots = useMemo(() => {
    const result: { x: number; y: number; opacity: number; size: number }[] = [];
    for (let i = 0; i < 150; i++) {
      result.push({
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
        opacity: Math.random() * 0.03 + 0.005,
        size: Math.random() * 1.2 + 0.3,
      });
    }
    return result;
  }, []);

  return (
    <View style={styles.grainContainer} pointerEvents="none">
      {dots.map((dot, i) => (
        <View
          key={i}
          style={[
            styles.grainDot,
            {
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              opacity: dot.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Phase 1: Logo appears centered
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;

  // Phase 2: Logo moves up, brand name appears
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;

  // Phase 3: Tagline + buttons appear
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Phase 1: Logo fades in and scales up (centered)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Phase 2: After 1.5s, logo moves up and brand name fades in
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoTranslateY, {
          toValue: -60,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);

    // Phase 3: After 2.2s, tagline + buttons appear
    setTimeout(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 2200);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background image */}
      <Image
        source={require('../../../assets/splash/BG_1.png')}
        style={styles.bgImage}
        resizeMode="cover"
        blurRadius={BLUR_RADIUS}
      />

      {/* Image control gradient */}
      <LinearGradient
        colors={[
          `rgba(228,52,20,${HIGHLIGHT_ALPHA})`,
          'rgba(0,0,0,0)',
          `rgba(0,0,0,${EXPOSURE_ALPHA})`,
          'rgba(0,0,0,0)',
          `rgba(0,0,0,${SHADOW_ALPHA})`,
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={styles.bgGradient}
      />

      {/* Film grain */}
      <GrainOverlay />

      {/* Logo — always visible, moves up after phase 1 */}
      <Animated.View
        style={[
          styles.logoCenter,
          {
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { translateY: logoTranslateY },
            ],
          },
        ]}
      >
        <Image
          source={require('../../../assets/New Logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Brand name — fades in after logo is settled */}
      <Animated.View style={[styles.brandSection, { opacity: brandOpacity }]}>
        <Text style={styles.brandName}>Corlify</Text>
      </Animated.View>

      {/* Tagline + Buttons — fade in last */}
      <Animated.View style={[styles.bottomSection, { opacity: contentOpacity }]}>
        <Text style={styles.tagline}>Find your vibe, make your move.</Text>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            onPress={() => navigation.replace('Auth')}
            style={styles.loginBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.replace('Signup')}
            style={styles.signUpBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to Corlify's{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          {/* Social Login */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
              <Ionicons name="logo-google" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
              <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  grainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  grainDot: {
    position: 'absolute',
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  logoCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
  },
  brandSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  brandName: {
    fontSize: 32,
    color: '#E43414',
    fontFamily: fonts.heading,
    fontWeight: '500',
    letterSpacing: 1,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.body,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonSection: {
    alignItems: 'center',
    gap: 12,
  },
  signUpBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E43414',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: fonts.button,
  },
  loginBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: fonts.button,
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  termsLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'underline',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
