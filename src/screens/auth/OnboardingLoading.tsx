import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '../../store';
import { fonts } from '../../theme/fonts';

const PROGRESS_DURATION = 10000;

const OnboardingLoading: React.FC = () => {
  const route = useRoute<any>();
  const { completeOnboarding } = useAuth();

  const { user, location, preferences } = route.params as {
    user: any;
    location: any;
    preferences: string[];
  };

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(100, {
      duration: PROGRESS_DURATION,
      easing: Easing.linear,
    });

    const timer = setTimeout(() => {
      completeOnboarding({ user, location, preferences });
    }, PROGRESS_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%` as unknown as number,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.text}>We're setting up your account</Text>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, barStyle]} />
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  text: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: fonts.body,
    marginBottom: 20,
  },
  track: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#FF6B4A',
  },
});

export default OnboardingLoading;
