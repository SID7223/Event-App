import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
  ImageSourcePropType,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const IMAGES: ImageSourcePropType[] = [
  require('../../../assets/splash/splash-1.jpg'),
  require('../../../assets/splash/splash-2.jpg'),
];

const IMAGE_DURATION = 7000;
const FADE_DURATION = 1200;

const GrainOverlay: React.FC = () => {
  const dots = useMemo(() => {
    const result: { x: number; y: number; opacity: number; size: number }[] = [];
    for (let i = 0; i < 300; i++) {
      result.push({
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
        opacity: Math.random() * 0.06 + 0.01,
        size: Math.random() * 1.5 + 0.5,
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

  const [currentIndex, setCurrentIndex] = useState(0);

  const img1Opacity = useRef(new Animated.Value(1)).current;
  const img2Opacity = useRef(new Animated.Value(0)).current;

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1400);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % IMAGES.length;

        if (prev % 2 === 0) {
          Animated.parallel([
            Animated.timing(img1Opacity, {
              toValue: 0,
              duration: FADE_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(img2Opacity, {
              toValue: 1,
              duration: FADE_DURATION,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          Animated.parallel([
            Animated.timing(img1Opacity, {
              toValue: 1,
              duration: FADE_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(img2Opacity, {
              toValue: 0,
              duration: FADE_DURATION,
              useNativeDriver: true,
            }),
          ]).start();
        }

        return next;
      });
    }, IMAGE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Image 1 */}
      <Animated.Image
        source={IMAGES[0]}
        style={[styles.bgImage, { opacity: img1Opacity }]}
        resizeMode="cover"
        blurRadius={3}
      />

      {/* Image 2 */}
      <Animated.Image
        source={IMAGES[1]}
        style={[styles.bgImage, { opacity: img2Opacity }]}
        resizeMode="cover"
        blurRadius={3}
      />

      {/* Base dark background */}
      <View style={styles.baseBg} />

      {/* Brightness dimming overlay */}
      <View style={styles.dimOverlay} />

      {/* Gradient overlay */}
      <LinearGradient
        colors={[
          'rgba(5,4,8,0.92)',
          'rgba(10,12,25,0.45)',
          'rgba(8,10,20,0.15)',
          'rgba(15,10,8,0.2)',
          'rgba(8,5,5,0.7)',
          'rgba(2,2,4,0.96)',
        ]}
        locations={[0, 0.1, 0.25, 0.5, 0.72, 0.9]}
        style={styles.bgGradient}
      />

      {/* Halation glow */}
      <LinearGradient
        colors={[
          'rgba(255,140,60,0)',
          'rgba(255,120,40,0)',
          'rgba(255,100,30,0.04)',
          'rgba(255,90,25,0.06)',
          'rgba(255,80,20,0.03)',
          'rgba(255,60,10,0)',
        ]}
        locations={[0, 0.2, 0.35, 0.5, 0.65, 0.85]}
        style={styles.halation}
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
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>C</Text>
          </View>
          <Text style={styles.appName}>Corlify</Text>
        </Animated.View>

        <Animated.View style={[styles.taglineSection, { opacity: taglineOpacity }]}>
          <Text style={styles.tagline}>Discover events.</Text>
          <Text style={styles.tagline}>Book experiences.</Text>
          <Text style={styles.tagline}>Make memories.</Text>
        </Animated.View>
      </View>

      {/* Buttons */}
      <Animated.View style={[styles.buttonSection, { opacity: buttonOpacity }]}>
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
  baseBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0C12',
    zIndex: -1,
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  halation: {
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
    marginTop: -120,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: 84,
    height: 84,
    borderRadius: 20,
    backgroundColor: 'rgba(255,80,40,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,74,0.35)',
  },
  logo: {
    fontSize: 50,
    fontWeight: '800',
    color: colors.accent.cyan,
    includeFontPadding: false,
    lineHeight: 56,
  },
  appName: {
    fontSize: 38,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: fonts.heading,
  },
  taglineSection: {
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  tagline: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '400',
    letterSpacing: 0.2,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  buttonSection: {
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 50,
    alignItems: 'center',
    gap: 12,
  },
  loginBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#C43A11',
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
  signUpBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: fonts.button,
  },
});

export default SplashScreen;
