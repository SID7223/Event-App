import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { fonts } from '../../theme/fonts';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
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

    // Auto-navigate to Auth after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Auth');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ImageBackground
        source={require('../../../assets/splash-bg.jpg')}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoSection,
              { opacity: logoOpacity, transform: [{ scale: logoScale }] },
            ]}
          >
            <View style={styles.zLogoContainer}>
              <Text style={styles.zLogo}>Z</Text>
            </View>
            <Text style={styles.appName}>Zyntr</Text>
          </Animated.View>

          {/* Tagline */}
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
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#99E1D9', '#E43414']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.getStartedBtn}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.replace('Auth')}
            style={styles.exploreBtn}
          >
            <Text style={styles.exploreText}>Explore Events</Text>
          </TouchableOpacity>
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,12,18,0.62)',
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
  zLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  zLogo: {
    fontSize: 52,
    fontWeight: '900',
    color: '#99E1D9',
    includeFontPadding: false,
    lineHeight: 58,
  },
  appName: {
    fontSize: 38,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: fonts.heading,
  },
  taglineSection: {
    alignItems: 'center',
    gap: 4,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '400',
    letterSpacing: 0.3,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  buttonSection: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 52,
    alignItems: 'center',
  },
  getStartedBtn: {
    width: 220,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  exploreBtn: {
    marginTop: 18,
    paddingVertical: 10,
  },
  exploreText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default SplashScreen;
