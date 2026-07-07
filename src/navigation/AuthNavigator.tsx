import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BrandSplashScreen from '../screens/auth/BrandSplashScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import LocationStep from '../screens/auth/LocationStep';
import VibeQuiz from '../screens/auth/VibeQuiz';
import OnboardingLoading from '../screens/auth/OnboardingLoading';
import AppGuideScreen from '../screens/auth/AppGuideScreen';

export type AuthStackParamList = {
  BrandSplash: undefined;
  Splash: undefined;
  Auth: undefined;
  Signup: undefined;
  LocationStep: { user: any };
  VibeQuiz: { user: any; location: any };
  OnboardingLoading: { user: any; location: any; preferences: string[] };
  AppGuide: { user: any; location: any; preferences: string[] };
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="BrandSplash"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' },
        animation: 'none',
      }}
    >
      <Stack.Screen name="BrandSplash" component={BrandSplashScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="LocationStep" component={LocationStep} />
      <Stack.Screen name="VibeQuiz" component={VibeQuiz} />
      <Stack.Screen name="OnboardingLoading" component={OnboardingLoading} />
      <Stack.Screen name="AppGuide" component={AppGuideScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
