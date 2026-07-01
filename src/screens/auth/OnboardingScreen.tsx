import React, { useState, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SLIDES = [
  {
    id: 0,
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    title: 'Discover',
    highlight: 'Amazing Events',
    desc: 'Find events around you that match your vibe.',
  },
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    title: 'Book Your',
    highlight: 'Experience',
    desc: 'Reserve your spot with easy & secure checkout.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
    title: 'Share the',
    highlight: 'Moment',
    desc: 'Connect with friends and create lasting memories.',
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [current, setCurrent] = useState(0);
  const slideAnim = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      // Fade out → switch slide → fade in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrent((prev) => prev + 1);
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      navigation.replace('Login');
    }
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.View style={[styles.card, { opacity: slideAnim }]}>
        <ImageBackground
          source={{ uri: slide.image }}
          style={styles.bg}
          resizeMode="cover"
        >
          {/* Full gradient overlay – stronger at bottom */}
          <LinearGradient
            colors={[
              'rgba(10,12,18,0.25)',
              'rgba(10,12,18,0.10)',
              'rgba(10,12,18,0.65)',
              'rgba(10,12,18,0.92)',
            ]}
            locations={[0, 0.35, 0.65, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Skip button – top right */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Bottom content */}
          <View style={styles.bottomContent}>
            {/* Dots */}
            <View style={styles.dots}>
              {SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === current ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>

            {/* Title */}
            <Text style={styles.titleLine}>{slide.title}</Text>
            <Text style={styles.highlightLine}>{slide.highlight}</Text>

            {/* Description */}
            <Text style={styles.desc}>{slide.desc}</Text>

            {/* Next / Get Started Button */}
            <TouchableOpacity
              style={styles.btnTouch}
              onPress={goNext}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={['#FF6B4A', '#E43414']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btn}
              >
                <Text style={styles.btnText}>
                  {isLast ? 'Get Started' : 'Next'}
                </Text>
                {!isLast && (
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Already have account */}
            {isLast && (
              <TouchableOpacity
                onPress={() => navigation.replace('Login')}
                style={styles.loginLink}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account?{' '}
                  <Text style={styles.loginLinkBold}>Login</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 10,
  },
  skipText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#FF6B4A',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  titleLine: {
    fontSize: 42,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 50,
  },
  highlightLine: {
    fontSize: 42,
    fontWeight: '800',
    color: '#E43414',
    lineHeight: 50,
    marginBottom: 16,
  },
  desc: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 24,
    marginBottom: 36,
  },
  btnTouch: {
    borderRadius: 30,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  loginLink: {
    marginTop: 20,
  },
  loginLinkText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    textAlign: 'center',
  },
  loginLinkBold: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default OnboardingScreen;
