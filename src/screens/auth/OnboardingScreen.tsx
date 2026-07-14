import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Defs, Circle, G } from 'react-native-svg';
import CachedImage from '../../components/ui/CachedImage';
import { Image } from 'expo-image';
import { Easing } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const LOGO_SIZE = SCREEN_W * 0.35;
const LOGO_R = LOGO_SIZE / 2;
const RING_SIZE = LOGO_SIZE + 20;
const RING_R = RING_SIZE / 2;
const RING_STROKE = 2.5;
const PILL_W = 56;
const PILL_H = 12;
const WAVE_LAYERS = 6;
const DARK_ORANGE = [
  'rgba(228, 52, 20, 0.6)',
  'rgba(228, 52, 20, 0.5)',
  'rgba(228, 52, 20, 0.42)',
  'rgba(228, 52, 20, 0.34)',
  'rgba(228, 52, 20, 0.26)',
  'rgba(228, 52, 20, 0.18)',
];

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

  const dotAnims = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const ringGlow = useRef(new Animated.Value(0.4)).current;
  const waveAnims = useRef(
    Array.from({ length: WAVE_LAYERS }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringGlow, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(ringGlow, {
          toValue: 0.4,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    waveAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 2400 + i * 200,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ).start();
    });
  }, []);

  useEffect(() => {
    dotAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === current ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [current]);

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.bg}>
        <CachedImage
          uri={slide.image}
          style={StyleSheet.absoluteFill}
          priority="high"
        />
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

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Logo with wave fill + glowing ring */}
        <View style={styles.logoCenter}>
          <GlowRing rotate={ringRotate} glow={ringGlow} />
          <View style={styles.logoCircle}>
            <Svg width={LOGO_SIZE} height={LOGO_SIZE}>
              {waveAnims.map((anim, j) => (
                <LogoWave
                  key={j}
                  anim={anim}
                  fillAnim={fillAnim}
                  index={j}
                />
              ))}
            </Svg>
          </View>
          <Image
            source={require('../../../assets/onboarding-icon.png')}
            style={styles.logoOverlay}
            contentFit="contain"
          />
        </View>

        <View style={styles.bottomContent}>
          <View style={styles.pills}>
            {SLIDES.map((_, i) => {
              const isActive = i === current;
              return (
                <View key={i} style={styles.pillTrack}>
                  {isActive ? (
                    <View style={styles.pillActiveWrap}>
                      <PillGlow rotate={ringRotate} glow={ringGlow} />
                      <View style={styles.pillActiveInner}>
                        <Svg width={PILL_W} height={PILL_H}>
                          {waveAnims.map((anim, j) => (
                            <PillWave
                              key={j}
                              anim={anim}
                              index={j}
                            />
                          ))}
                        </Svg>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.pillInactive} />
                  )}
                </View>
              );
            })}
          </View>

          <Text style={styles.titleLine}>{slide.title}</Text>
          <Text style={styles.highlightLine}>{slide.highlight}</Text>
          <Text style={styles.desc}>{slide.desc}</Text>

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
      </View>
    </View>
  );
};

const GlowRing = ({ rotate, glow }: { rotate: Animated.Value; glow: Animated.Value }) => {
  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const opacity = glow;

  return (
    <View style={styles.ringContainer}>
      <Animated.View
        style={[
          styles.ringOuter,
          {
            transform: [{ rotate: rotation }],
            opacity,
          },
        ]}
      >
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="40%" stopColor="rgba(200,220,255,0.3)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.0)" />
              <stop offset="100%" stopColor="rgba(200,220,255,0.5)" />
            </linearGradient>
          </Defs>
          <Circle
            cx={RING_R}
            cy={RING_R}
            r={RING_R - RING_STROKE}
            stroke="url(#ring-grad)"
            strokeWidth={RING_STROKE}
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const PillGlow = ({ rotate, glow }: { rotate: Animated.Value; glow: Animated.Value }) => {
  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const opacity = glow;

  return (
    <View style={styles.pillGlowContainer}>
      <Animated.View
        style={[
          styles.pillGlowOuter,
          {
            transform: [{ rotate: rotation }],
            opacity,
          },
        ]}
      >
        <Svg width={PILL_W + 4} height={PILL_H + 4}>
          <Defs>
            <linearGradient id="pill-ring-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="50%" stopColor="rgba(255,107,74,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
            </linearGradient>
          </Defs>
          <Circle
            cx={(PILL_W + 4) / 2}
            cy={(PILL_H + 4) / 2}
            r={(PILL_H + 4) / 2 - 1}
            stroke="url(#pill-ring-grad)"
            strokeWidth={1.5}
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const LogoWave = ({ anim, fillAnim, index }: {
  anim: Animated.Value;
  fillAnim: Animated.Value;
  index: number;
}) => {
  const [d, setD] = React.useState('');
  const fillRef = useRef(0);

  useEffect(() => {
    const f = fillAnim.addListener(({ value }) => { fillRef.current = value; });
    const w = anim.addListener(({ value }) => {
      const phase = value * Math.PI * 2 + index * 0.8;
      const amp = 2.5 + index * 1;
      const freq = 2.5 + index * 0.3;
      const waterY = LOGO_SIZE * (1 - fillRef.current) + Math.sin(phase) * 2;
      let path = '';
      for (let x = 0; x <= LOGO_SIZE; x += 3) {
        const ratio = x / LOGO_SIZE;
        const y = waterY + Math.sin(ratio * Math.PI * freq + phase) * amp;
        path += `${x === 0 ? 'M' : 'L'}${x},${y} `;
      }
      setD(path + `L${LOGO_SIZE},${LOGO_SIZE} L0,${LOGO_SIZE} Z`);
    });
    return () => { fillAnim.removeListener(f); anim.removeListener(w); };
  }, []);

  return <Path d={d} fill={DARK_ORANGE[index]} />;
};

const PillWave = ({ anim, index }: {
  anim: Animated.Value;
  index: number;
}) => {
  const [d, setD] = React.useState('');

  useEffect(() => {
    const listener = anim.addListener(({ value }) => {
      const phase = value * Math.PI * 2 + index * 0.8;
      const amp = 1.5 + index * 0.35;
      const freq = 2.5 + index * 0.3;
      let path = '';
      for (let x = 0; x <= PILL_W; x += 3) {
        const ratio = x / PILL_W;
        const y = PILL_H * 0.55 + Math.sin(ratio * Math.PI * freq + phase) * amp;
        path += `${x === 0 ? 'M' : 'L'}${x},${y} `;
      }
      setD(path + `L${PILL_W},${PILL_H} L0,${PILL_H} Z`);
    });
    return () => anim.removeListener(listener);
  }, []);

  return <Path d={d} fill={DARK_ORANGE[index]} />;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
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
  logoCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringContainer: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  logoOverlay: {
    position: 'absolute',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  pills: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  pillTrack: {
    width: PILL_W,
    height: PILL_H,
  },
  pillActiveWrap: {
    width: PILL_W + 4,
    height: PILL_H + 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillGlowContainer: {
    position: 'absolute',
    width: PILL_W + 4,
    height: PILL_H + 4,
  },
  pillGlowOuter: {
    width: PILL_W + 4,
    height: PILL_H + 4,
  },
  pillActiveInner: {
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_H / 2,
    overflow: 'hidden',
  },
  pillInactive: {
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_H / 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
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
