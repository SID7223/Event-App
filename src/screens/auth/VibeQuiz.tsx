import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../store';
import { UserLocation, User } from '../../types';
import { fonts } from '../../theme/fonts';

interface VibeOption {
  id: string;
  label: string;
  icon: string;
  categories: string[];
}

const VIBE_OPTIONS: VibeOption[] = [
  { id: 'live_music', label: 'Live Music', icon: 'musical-notes', categories: ['Music', 'Concerts', 'Qawwali'] },
  { id: 'nightlife', label: 'Nightlife & DJs', icon: 'color-wand', categories: ['Nightlife', 'DJ', 'Parties', 'Electronic'] },
  { id: 'comedy', label: 'Comedy & Mic', icon: 'mic', categories: ['Comedy', 'Standup', 'Open Mic'] },
  { id: 'tech', label: 'Tech & Startups', icon: 'briefcase', categories: ['Tech', 'Startups', 'Networking', 'Pitch Nights'] },
  { id: 'wellness', label: 'Wellness', icon: 'leaf', categories: ['Wellness', 'Yoga', 'Marathons', 'Retreats'] },
  { id: 'arts_culture', label: 'Arts & Culture', icon: 'color-palette', categories: ['Art', 'Theater', 'Heritage', 'Exhibitions'] },
  { id: 'popups_festivals', label: 'Pop-ups & Fest', icon: 'storefront', categories: ['Festivals', 'Food Festivals', 'Flea Markets', 'Pop-ups'] },
  { id: 'workshops', label: 'Workshops', icon: 'book', categories: ['Workshops', 'Masterclasses', 'Skill Learning'] },
  { id: 'poetry', label: 'Poetry & Literary', icon: 'pencil', categories: ['Poetry', 'Mushaira', 'Baithak', 'Storytelling'] },
  { id: 'fashion', label: 'Fashion & Lifestyle', icon: 'shirt', categories: ['Fashion', 'Thrift', 'Brand Exhibits', 'Lifestyle'] },
  { id: 'screenings', label: 'Screenings', icon: 'football', categories: ['Screenings', 'PSL', 'World Cup', 'Watch Parties'] },
  { id: 'gaming', label: 'Gaming & E-Sports', icon: 'game-controller', categories: ['Gaming', 'E-Sports', 'Tournaments', 'Board Games'] },
];

const MIN_SELECTIONS = 3;
const COLS = 3;

const VibeQuiz: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setPreferences } = useAuth();

  const { width } = useWindowDimensions();
  const itemSize = (width - 40 - 16) / COLS;

  const user: User = route.params?.user;
  const location: UserLocation = route.params?.location;

  const [selected, setSelected] = useState<string[]>([]);
  const [itemAnims] = useState(
    VIBE_OPTIONS.map(() => ({
      scale: new Animated.Value(1),
      bgOpacity: new Animated.Value(0),
      checkScale: new Animated.Value(0),
    }))
  );

  const fadeIn = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;
  const contentFadeIn = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(headerSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentFadeIn, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const toggleItem = (itemId: string) => {
    const index = VIBE_OPTIONS.findIndex(v => v.id === itemId);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelected((prev) => {
      const isSelected = prev.includes(itemId);
      const newSelection = isSelected
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      // Scale bounce
      Animated.sequence([
        Animated.timing(itemAnims[index].scale, {
          toValue: 0.9,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(itemAnims[index].scale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Background fill
      Animated.timing(itemAnims[index].bgOpacity, {
        toValue: isSelected ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Checkmark
      Animated.spring(itemAnims[index].checkScale, {
        toValue: isSelected ? 0 : 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }).start();

      return newSelection;
    });
  };

  const handleContinue = () => {
    if (selected.length >= MIN_SELECTIONS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPreferences(selected);
      navigation.navigate('OnboardingLoading', {
        user,
        location,
        preferences: selected,
      });
    }
  };

  const canContinue = selected.length >= MIN_SELECTIONS;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Animated.View
            style={[
              styles.header,
              { opacity: fadeIn, transform: [{ translateY: headerSlide }] },
            ]}
          >
            <Text style={styles.titleRegular}>What kind of events are</Text>
            <Text style={styles.titleBold}>you looking for?</Text>
          </Animated.View>

          <Text style={styles.subtitle}>
            Select at least three
          </Text>

          {/* Content - fades in after header */}
          <Animated.View
            style={{
              opacity: contentFadeIn,
              transform: [{ translateY: contentSlide }],
              flex: 1,
            }}
          >
            {/* Grid */}
            <View style={styles.grid}>
              {VIBE_OPTIONS.map((vibe, index) => {
                const isSelected = selected.includes(vibe.id);

                return (
                  <TouchableOpacity
                    key={vibe.id}
                    onPress={() => toggleItem(vibe.id)}
                    activeOpacity={0.8}
                    style={[styles.gridItem, { width: itemSize }]}
                  >
                    <Animated.View
                      style={[
                        styles.circle,
                        {
                          width: itemSize - 50,
                          height: itemSize - 50,
                          borderRadius: (itemSize - 50) / 2,
                          transform: [{ scale: itemAnims[index].scale }],
                        },
                      ]}
                    >
                      {/* Green background fill */}
                      <Animated.View
                        style={[
                          styles.circleFill,
                          {
                            borderRadius: (itemSize - 8) / 2,
                            opacity: itemAnims[index].bgOpacity,
                          },
                        ]}
                      />
                      {/* Icon */}
                      <Ionicons name={vibe.icon as any} size={24} color="#FFFFFF" style={{ zIndex: 1 }} />
                    </Animated.View>
                    <Text
                      style={[
                        styles.itemLabel,
                        isSelected && styles.itemLabelActive,
                      ]}
                      numberOfLines={1}
                    >
                      {vibe.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Counter */}
            <View style={styles.counterRow}>
              <Text style={styles.counterText}>
                {selected.length} of {VIBE_OPTIONS.length} selected
              </Text>
              {selected.length > 0 && selected.length < MIN_SELECTIONS && (
                <Text style={styles.counterHint}>
                  Select {MIN_SELECTIONS - selected.length} more
                </Text>
              )}
            </View>
            <Text style={styles.hintText}>
              (You can change interests in profile section also.)
            </Text>
          </Animated.View>
        </ScrollView>

        {/* Continue Button */}
        <Animated.View
          style={[
            styles.bottomContainer,
            { opacity: contentFadeIn, transform: [{ translateY: contentSlide }] },
          ]}
        >
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!canContinue}
            activeOpacity={0.88}
          >
            <View style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}>
              <Text style={styles.continueBtnText}>Continue</Text>
              <View style={styles.continueArrow}>
                <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    marginTop: 46,
    marginBottom: 16,
  },
  titleRegular: {
    fontSize: 21,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    letterSpacing: -0.3,
  },
  titleBold: {
    fontSize: 23,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: fonts.body,
    marginTop: 10,
    marginBottom: 26,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    alignItems: 'center',
    marginBottom: 5,
  },
  circle: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  circleFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E43414',
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  itemLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 36,
  },
  counterText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: fonts.body,
  },
  counterHint: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  hintText: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 6,
    fontFamily: fonts.body,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: 'rgba(10,12,18,0.95)',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E43414',
    gap: 8,
  },
  continueBtnDisabled: {
    opacity: 0.3,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  continueArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VibeQuiz;
