import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../store';
import { fonts } from '../../theme/fonts';

const { width } = Dimensions.get('window');

const LOADING_STEPS = [
  { text: 'Setting up your preferences...', icon: 'settings-outline' },
  { text: 'Finding events near you...', icon: 'location-outline' },
  { text: 'Personalizing your feed...', icon: 'sparkles-outline' },
];

const OnboardingLoading: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { location, preferences } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const fadeIn = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const stepAnimations = LOADING_STEPS.map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
    checkScale: new Animated.Value(0),
  }));
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Logo animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Start loading steps
    startLoadingSteps();
  }, []);

  const startLoadingSteps = async () => {
    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setCurrentStep(i);
      
      // Animate step in
      await new Promise<void>((resolve) => {
        Animated.parallel([
          Animated.timing(stepAnimations[i].opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(stepAnimations[i].translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => resolve());
      });

      // Wait before showing checkmark
      await new Promise(resolve => setTimeout(resolve, 600));

      // Show checkmark
      Animated.spring(stepAnimations[i].checkScale, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();

      // Wait before next step
      if (i < LOADING_STEPS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    // All steps complete
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsComplete(true);

    // Navigate to main app
    setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      });
    }, 800);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0C12" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeIn }]}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: logoScale }],
                  opacity: logoOpacity,
                },
              ]}
            >
              <LinearGradient
                colors={['#FF6B4A', '#E43414']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>Z</Text>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.appName}>Zyntr</Text>
          </View>

          {/* Loading Steps */}
          <View style={styles.stepsContainer}>
            {LOADING_STEPS.map((step, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.step,
                  {
                    opacity: stepAnimations[index].opacity,
                    transform: [{ translateY: stepAnimations[index].translateY }],
                  },
                ]}
              >
                <View style={styles.stepIconContainer}>
                  <Ionicons
                    name={step.icon as any}
                    size={20}
                    color={index <= currentStep ? '#FF6B4A' : 'rgba(255,255,255,0.3)'}
                  />
                </View>
                <Text
                  style={[
                    styles.stepText,
                    index <= currentStep && styles.stepTextActive,
                  ]}
                >
                  {step.text}
                </Text>
                <Animated.View
                  style={{
                    transform: [{ scale: stepAnimations[index].checkScale }],
                  }}
                >
                  {index <= currentStep && (
                    <Ionicons name="checkmark-circle" size={22} color="#2ED573" />
                  )}
                </Animated.View>
              </Animated.View>
            ))}
          </View>

          {/* Location Info */}
          {location && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color="#FF6B4A" />
              <Text style={styles.locationText}>{location.fullAddress}</Text>
            </View>
          )}

          {/* Preferences Count */}
          {preferences && preferences.length > 0 && (
            <View style={styles.preferencesInfo}>
              <Ionicons name="sparkles" size={16} color="#E43414" />
              <Text style={styles.preferencesText}>
                {preferences.length} preferences selected
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Completion Animation */}
        {isComplete && (
          <Animated.View style={[styles.completionOverlay, { opacity: fadeOut }]}>
            <Animated.View style={styles.completionCheck}>
              <Ionicons name="checkmark-circle" size={80} color="#2ED573" />
            </Animated.View>
            <Text style={styles.completionText}>You're all set!</Text>
          </Animated.View>
        )}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    includeFontPadding: false,
    lineHeight: 54,
  },
  appName: {
    fontSize: 32,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: fonts.heading,
  },
  stepsContainer: {
    width: '100%',
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  preferencesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  preferencesText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  completionOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0A0C12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionCheck: {
    marginBottom: 20,
  },
  completionText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default OnboardingLoading;
