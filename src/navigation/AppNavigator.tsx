import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import VenueProfileScreen from '../screens/events/VenueProfileScreen';
import OrganizerProfileScreen from '../screens/events/OrganizerProfileScreen';
import BookingScreen from '../screens/events/BookingScreen';
import EditProfileScreen from '../screens/events/EditProfileScreen';
import FollowingScreen from '../screens/main/FollowingScreen';
import FriendsScreen from '../screens/social/FriendsScreen';
import HostEventScreen from '../screens/events/HostEventScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import CinemaScreen from '../screens/main/CinemaScreen';
import DiningScreen from '../screens/main/DiningScreen';
import PlaySportsScreen from '../screens/main/PlaySportsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import OneStepLoginSheet from '../components/OneStepLoginSheet';
import AppGuideScreen from '../screens/auth/AppGuideScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EventDetail: { eventId: string };
  VenueProfile: { venueId: string };
  OrganizerProfile: { organizerId: string };
  Booking: { eventId: string };
  EditProfile: undefined;
  Following: undefined;
  Friends: undefined;
  HostEvent: undefined;
  Notifications: undefined;
  Cinema: undefined;
  Dining: undefined;
  PlaySports: undefined;
  Settings: undefined;
  AppGuide: { replay: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isLoggedIn, onboardingComplete, savedLogin, setSavedLogin, login, user } = useAuth();
  const [showOneStepLogin, setShowOneStepLogin] = useState(false);

  useEffect(() => {
    if (!isLoggedIn && !onboardingComplete && savedLogin) {
      const timer = setTimeout(() => {
        setShowOneStepLogin(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, onboardingComplete, savedLogin]);

  const handleOneStepLogin = () => {
    if (savedLogin && user) {
      login(user);
      setShowOneStepLogin(false);
    } else if (savedLogin) {
      const mockUser = {
        id: Date.now().toString(),
        firstName: savedLogin.firstName,
        lastName: savedLogin.lastName,
        email: savedLogin.email,
        phone: '',
        avatar: '',
        interests: [],
        notifications: true,
      };
      login(mockUser);
      setShowOneStepLogin(false);
    }
  };

  const handleDismissOneStep = () => {
    setShowOneStepLogin(false);
  };

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#000000' },
        }}
      >
        {!isLoggedIn || !onboardingComplete ? (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainNavigator}
            />
            <Stack.Screen
              name="EventDetail"
              component={EventDetailScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="VenueProfile"
              component={VenueProfileScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="OrganizerProfile"
              component={OrganizerProfileScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen
              name="Following"
              component={FollowingScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Friends"
              component={FriendsScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="HostEvent"
              component={HostEventScreen}
              options={{ presentation: 'card', animation: 'slide_from_left' }}
            />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Cinema" component={CinemaScreen} />
            <Stack.Screen name="Dining" component={DiningScreen} />
            <Stack.Screen name="PlaySports" component={PlaySportsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
              name="AppGuide"
              component={AppGuideScreen}
              options={{ presentation: 'card' }}
            />
          </>
        )}
      </Stack.Navigator>

      {savedLogin && (
        <OneStepLoginSheet
          visible={showOneStepLogin}
          userName={`${savedLogin.firstName} ${savedLogin.lastName}`.trim() || savedLogin.email}
          onLogin={handleOneStepLogin}
          onDismiss={handleDismissOneStep}
        />
      )}
    </>
  );
};

export default AppNavigator;
