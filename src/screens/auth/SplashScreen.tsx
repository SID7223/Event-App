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
import { fonts } from '../../theme/fonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Image Control Constants ──
// Tweak these numbers to control the background image appearance
const SHADOW_ALPHA = 12;   // darkens bottom          (0–1)
const HIGHLIGHT_ALPHA = 0.17;   // warms top               (0–1)
const EXPOSURE_ALPHA = 0.04;   // overall mid dimming      (0–1)
const BLUR_RADIUS = 2;      // background blur          (0–20)

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

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

    setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1200);

    setTimeout(() => {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1400);
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

      {/* Content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoSection,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image
            source={require('../../../assets/New Logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text style={[styles.sloganLine1, { opacity: taglineOpacity }]}>
          Where Moments Begin
        </Animated.Text>
        <Animated.Text style={[styles.sloganLine2, { opacity: taglineOpacity }]}>
          Let It Happen
        </Animated.Text>
      </View>

      {/* Buttons */}
      <Animated.View style={[styles.buttonSection, { opacity: buttonOpacity }]}>
        <TouchableOpacity
          onPress={() => navigation.replace('Signup')}
          style={styles.signUpBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.replace('Auth')}
          style={styles.loginBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 110,
    height: 110,
    marginLeft: -2,
    marginTop: 8,
  },
  sloganLine1: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    fontFamily: fonts.splashSlogan,
    marginTop: 8,
    fontStyle: 'italic',
  },
  sloganLine2: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.5,
    fontFamily: fonts.splashSlogan,
    marginTop: 6,
    fontStyle: 'italic',
  },
  buttonSection: {
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 50,
    alignItems: 'center',
    gap: 12,
  },
  signUpBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#000000',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#888888',
  },
  loginText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: fonts.button,
  },
});

export default SplashScreen;
