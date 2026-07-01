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
  color: string;
}

const VIBE_OPTIONS: VibeOption[] = [
  { id: 'creative', label: 'Creative', icon: '🎨', color: '#A855F7' },
  { id: 'professional', label: 'Professional', icon: '💼', color: '#3B82F6' },
  { id: 'watch_parties', label: 'Watch Parties', icon: '🍿', color: '#F97316' },
  { id: 'live_shows', label: 'Live Shows', icon: '🎤', color: '#E43414' },
  { id: 'foodie', label: 'Foodie', icon: '🍲', color: '#22C55E' },
  { id: 'music', label: 'Music', icon: '🎸', color: '#FF6B4A' },
  { id: 'sports', label: 'Sports', icon: '🏃', color: '#EAB308' },
  { id: 'theater', label: 'Theater & Arts', icon: '🎭', color: '#EC4899' },
];

const MIN_SELECTIONS = 3;

const VibeQuiz: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setPreferences, completeOnboarding } = useAuth();
  
  const user: User = route.params?.user;
  const location: UserLocation = route.params?.location;
  
  const [selected, setSelected] = useState<string[]>([]);
  const [chipAnimations] = useState(
    VIBE_OPTIONS.map(() => ({
      scale: new Animated.Value(1),
      checkmark: new Animated.Value(0),
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

  const toggleChip = (chipId: string) => {
    const index = VIBE_OPTIONS.findIndex(v => v.id === chipId);
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSelected((prev) => {
      const isSelected = prev.includes(chipId);
      const newSelection = isSelected
        ? prev.filter((id) => id !== chipId)
        : [...prev, chipId];
      
      // Animate chip
      Animated.sequence([
        Animated.timing(chipAnimations[index].scale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(chipAnimations[index].scale, {
          toValue: 1,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Animate checkmark
      Animated.timing(chipAnimations[index].checkmark, {
        toValue: isSelected ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      return newSelection;
    });
  };

  const handleContinue = () => {
    if (selected.length >= MIN_SELECTIONS) {
      // Haptic feedback for success
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setPreferences(selected);
      completeOnboarding({
        user,
        location,
        preferences: selected,
      });
      
      navigation.navigate('OnboardingLoading');
    }
  };

  const canContinue = selected.length >= MIN_SELECTIONS;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0C12" />
      <SafeAreaView style={styles.safeArea}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#FF6B4A', '#E43414']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: '100%' }]}
            />
          </View>
          <Text style={styles.progressText}>Step 2 of 2</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeIn,
                transform: [{ translateY: headerSlide }],
              },
            ]}
          >
            <Text style={styles.title}>What's your vibe?</Text>
            <Text style={styles.subtitle}>
              Pick at least {MIN_SELECTIONS} to personalize your feed
            </Text>
          </Animated.View>

          {/* Selection Counter */}
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              <Text style={[styles.counterNumber, canContinue && styles.counterNumberActive]}>
                {selected.length}
              </Text>
              {' '}of {VIBE_OPTIONS.length} selected
            </Text>
            {selected.length > 0 && selected.length < MIN_SELECTIONS && (
              <Text style={styles.counterHint}>
                Select {MIN_SELECTIONS - selected.length} more
              </Text>
            )}
          </View>

          {/* Chip Grid */}
          <View style={styles.chipGrid}>
            {VIBE_OPTIONS.map((vibe, index) => {
              const isSelected = selected.includes(vibe.id);
              
              return (
                <TouchableOpacity
                  key={vibe.id}
                  onPress={() => toggleChip(vibe.id)}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      styles.chip,
                      {
                        transform: [{ scale: chipAnimations[index].scale }],
                      },
                      isSelected && styles.chipSelected,
                      isSelected && { borderColor: vibe.color },
                    ]}
                  >
                    {isSelected && (
                      <Animated.View
                        style={[
                          styles.chipBackground,
                          {
                            opacity: chipAnimations[index].checkmark,
                            backgroundColor: vibe.color,
                          },
                        ]}
                      />
                    )}
                    <View style={styles.chipContent}>
                      <Text style={styles.chipIcon}>{vibe.icon}</Text>
                      <Text
                        style={[
                          styles.chipLabel,
                          isSelected && styles.chipLabelSelected,
                        ]}
                      >
                        {vibe.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Animated.View
                        style={[
                          styles.checkmark,
                          {
                            transform: [
                              {
                                scale: chipAnimations[index].checkmark,
                              },
                            ],
                          },
                        ]}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </Animated.View>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Ionicons name="information-circle-outline" size={18} color="rgba(255,255,255,0.4)" />
            <Text style={styles.tipsText}>
              You can always change these later in Settings
            </Text>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!canContinue}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={canContinue ? ['#FF6B4A', '#E43414'] : ['#333', '#333']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
            >
              <Text style={styles.continueBtnText}>Find My Events</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
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
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: fonts.heading,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  counterText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  counterNumber: {
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  counterNumberActive: {
    color: '#FF6B4A',
  },
  counterHint: {
    fontSize: 13,
    color: '#FF6B4A',
    fontWeight: '500',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  chipSelected: {
    borderColor: '#FF6B4A',
  },
  chipBackground: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  chipIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  chipLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fonts.bodyBold,
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    gap: 10,
  },
  tipsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    flex: 1,
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
    borderRadius: 18,
    gap: 8,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

export default VibeQuiz;
