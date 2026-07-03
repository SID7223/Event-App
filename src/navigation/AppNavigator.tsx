import React from 'react';
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isLoggedIn, onboardingComplete } = useAuth();

  return (
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
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
