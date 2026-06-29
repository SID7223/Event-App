import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import BookingScreen from '../screens/events/BookingScreen';
import EditProfileScreen from '../screens/events/EditProfileScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EventDetail: { eventId: string };
  Booking: { eventId: string };
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isLoggedIn ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
