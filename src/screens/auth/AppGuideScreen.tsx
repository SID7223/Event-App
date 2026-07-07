import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useAuth } from '../../store';
import { fonts } from '../../theme/fonts';

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'home-outline' as const,
    title: 'Discover Your City',
    description: 'A dynamic header and curated event feed — always something new around you.',
    color: '#FF6B4A',
  },
  {
    icon: 'search-outline' as const,
    title: 'Find the Perfect Vibe',
    description: 'Search by mood, category, or moment. Filters that actually get you.',
    color: '#E43414',
  },
  {
    icon: 'people-outline' as const,
    title: "See What's the Move",
    description: 'Your friends\' plans, visible RSVPs, and the social layer that creates FOMO.',
    color: '#FF6B4A',
  },
  {
    icon: 'ticket-outline' as const,
    title: 'Your Weekend, Sorted',
    description: 'All your tickets in one place. Upcoming events at a glance — no scrolling.',
    color: '#E43414',
  },
  {
    icon: 'person-outline' as const,
    title: 'Make It Yours',
    description: 'Settings, privacy, and preferences — the app adapts to you, not the other way.',
    color: '#FF6B4A',
  },
];

const AppGuideScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { completeOnboarding } = useAuth();
  const pagerRef = useRef<PagerView>(null);

  const isReplay = route.params?.replay ?? false;

  const [activeIndex, setActiveIndex] = useState(0);
  const dotAnimations = SLIDES.map(() => useSharedValue(0));

  const handlePageSelected = useCallback((e: any) => {
    const idx = e.nativeEvent.position;
    setActiveIndex(idx);
    dotAnimations.forEach((dot, i) => {
      dot.value = withTiming(i === idx ? 1 : 0, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });
    });
  }, []);

  const handleNext = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      pagerRef.current?.setPage(activeIndex + 1);
    }
  }, [activeIndex]);

  const handleComplete = useCallback(() => {
    if (isReplay) {
      navigation.goBack();
    } else {
      completeOnboarding({
        user: route.params?.user,
        location: route.params?.location,
        preferences: route.params?.preferences,
      });
    }
  }, [isReplay, navigation, completeOnboarding, route.params]);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safe}>
        {/* Skip / Close */}
        {!isLastSlide && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={isReplay ? () => navigation.goBack() : handleComplete}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>{isReplay ? 'Close' : 'Skip'}</Text>
          </TouchableOpacity>
        )}

        {/* Slides */}
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={handlePageSelected}
          overdrag
        >
          {SLIDES.map((slide, idx) => (
            <View key={idx} style={styles.slide}>
              <View style={[styles.iconCircle, { backgroundColor: `${slide.color}15`, borderColor: `${slide.color}30` }]}>
                <Ionicons name={slide.icon} size={48} color={slide.color} />
              </View>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          ))}
        </PagerView>

        {/* Bottom */}
        <View style={styles.bottom}>
          {/* Dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, idx) => (
              <Dot key={idx} anim={dotAnimations[idx]} color={SLIDES[idx].color} />
            ))}
          </View>

          {/* Action */}
          {isLastSlide ? (
            <TouchableOpacity style={styles.goBtn} onPress={handleComplete} activeOpacity={0.85}>
              <Text style={styles.goBtnText}>{isReplay ? 'Close' : "Let's Go"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.7}>
              <Text style={styles.nextText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#FF6B4A" />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const Dot = ({ anim, color }: { anim: SharedValue<number>; color: string }) => {
  const style = useAnimatedStyle(() => ({
    width: withTiming(anim.value === 1 ? 24 : 8, { duration: 250, easing: Easing.out(Easing.ease) }),
    backgroundColor: anim.value === 1 ? color : 'rgba(255,255,255,0.2)',
  }));

  return <Animated.View style={[styles.dot, style]} />;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  safe: { flex: 1 },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: fonts.bodyBold,
  },
  pager: { flex: 1 },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.55)',
    fontFamily: fonts.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 40,
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  goBtn: {
    width: SCREEN_W - 80,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FF6B4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fonts.button,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B4A',
    fontFamily: fonts.bodyBold,
  },
});

export default AppGuideScreen;
