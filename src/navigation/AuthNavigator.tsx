import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/auth/SplashScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import LocationStep from '../screens/auth/LocationStep';
import VibeQuiz from '../screens/auth/VibeQuiz';
import OnboardingLoading from '../screens/auth/OnboardingLoading';

export type AuthStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Signup: undefined;
  LocationStep: { user: any };
  VibeQuiz: { user: any; location: any };
  OnboardingLoading: { user: any; location: any; preferences: string[] };
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0A0C12' },
        cardStyleInterpolator: () => ({
          cardStyle: { opacity: 1 },
        }),
        transitionSpec: {
          open: { animation: 'timing', config: { duration: 0 } },
          close: { animation: 'timing', config: { duration: 0 } },
        },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="LocationStep" component={LocationStep} />
      <Stack.Screen name="VibeQuiz" component={VibeQuiz} />
      <Stack.Screen name="OnboardingLoading" component={OnboardingLoading} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
