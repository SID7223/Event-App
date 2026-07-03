import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../store';
import { UserLocation, User } from '../../types';
import { fonts } from '../../theme/fonts';

const { width } = Dimensions.get('window');

interface VibeOption {
  id: string;
  label: string;
  icon: string;
}

const VIBE_OPTIONS: VibeOption[] = [
  { id: 'creative', label: 'Creative', icon: '🎨' },
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'watch_parties', label: 'Watch Parties', icon: '🍿' },
  { id: 'live_shows', label: 'Live Shows', icon: '🎤' },
  { id: 'foodie', label: 'Foodie', icon: '🍲' },
  { id: 'music', label: 'Music', icon: '🎸' },
  { id: 'sports', label: 'Sports', icon: '🏃' },
  { id: 'theater', label: 'Theater & Arts', icon: '🎭' },
];

const MIN_SELECTIONS = 3;
const COLS = 3;
const ITEM_SIZE = (width - 48 - 24) / COLS;

const VibeQuiz: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setPreferences } = useAuth();

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
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
      <StatusBar barStyle="light-content" backgroundColor="#0A0C12" />
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
            <Text style={styles.titleRegular}>Choose 3 or more</Text>
            <Text style={styles.titleBold}>interests</Text>
          </Animated.View>

          {/* Grid */}
          <View style={styles.grid}>
            {VIBE_OPTIONS.map((vibe, index) => {
              const isSelected = selected.includes(vibe.id);

              return (
                <TouchableOpacity
                  key={vibe.id}
                  onPress={() => toggleItem(vibe.id)}
                  activeOpacity={0.8}
                  style={styles.gridItem}
                >
                  <Animated.View
                    style={[
                      styles.circle,
                      {
                        transform: [{ scale: itemAnims[index].scale }],
                      },
                    ]}
                  >
                    {/* Green background fill */}
                    <Animated.View
                      style={[
                        styles.circleFill,
                        { opacity: itemAnims[index].bgOpacity },
                      ]}
                    />
                    {/* Emoji */}
                    <Text style={styles.emoji}>{vibe.icon}</Text>
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
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.bottomContainer}>
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
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
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
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    marginTop: 16,
    marginBottom: 32,
  },
  titleRegular: {
    fontSize: 28,
    fontWeight: '400',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    letterSpacing: -0.3,
  },
  titleBold: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: ITEM_SIZE,
    alignItems: 'center',
    marginBottom: 8,
  },
  circle: {
    width: ITEM_SIZE - 16,
    height: ITEM_SIZE - 16,
    borderRadius: (ITEM_SIZE - 16) / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  circleFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E43414',
    borderRadius: (ITEM_SIZE - 16) / 2,
  },
  emoji: {
    fontSize: 32,
    zIndex: 1,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  itemLabelActive: {
    color: '#FFFFFF',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  counterText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: fonts.body,
  },
  counterHint: {
    fontSize: 13,
    color: '#FF6B4A',
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 8,
    fontFamily: fonts.body,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
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
