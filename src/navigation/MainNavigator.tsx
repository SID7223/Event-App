import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/main/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import MyPlansScreen from '../screens/main/MyPlansScreen';
import CinemaScreen from '../screens/main/CinemaScreen';
import DiningScreen from '../screens/main/DiningScreen';
import PlaySportsScreen from '../screens/main/PlaySportsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import EditProfileScreen from '../screens/events/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import Sidebar from '../components/layout/Sidebar';
import GlassNavbar from '../components/ui/GlassNavbar';

export type MainTabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  PlansTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator();
const ExploreStack = createStackNavigator();
const PlansStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const TABS = [
  { name: 'HomeTab' as const, icon: 'home' as const, iconOutline: 'home-outline' as const },
  { name: 'ExploreTab' as const, icon: 'compass' as const, iconOutline: 'compass-outline' as const },
  { name: 'PlansTab' as const, icon: 'calendar' as const, iconOutline: 'calendar-outline' as const },
  { name: 'ProfileTab' as const, icon: 'person' as const, iconOutline: 'person-outline' as const },
];

const HomeStackNavigator: React.FC<{ onToggleSidebar: () => void; sidebarVisible: boolean }> = ({ onToggleSidebar, sidebarVisible }) => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home">
      {(props) => <HomeScreen {...props} onOpenSidebar={onToggleSidebar} sidebarVisible={sidebarVisible} />}
    </HomeStack.Screen>
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    <HomeStack.Screen name="EventDetail" component={EventDetailScreen} />
  </HomeStack.Navigator>
);

const ExploreStackNavigator: React.FC = () => (
  <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
    <ExploreStack.Screen name="Explore" component={ExploreScreen} />
    <ExploreStack.Screen name="EventDetail" component={EventDetailScreen} />
    <ExploreStack.Screen name="Cinema" component={CinemaScreen} />
    <ExploreStack.Screen name="Dining" component={DiningScreen} />
    <ExploreStack.Screen name="PlaySports" component={PlaySportsScreen} />
  </ExploreStack.Navigator>
);

const PlansStackNavigator: React.FC = () => (
  <PlansStack.Navigator screenOptions={{ headerShown: false }}>
    <PlansStack.Screen name="PlansMain" component={MyPlansScreen} />
    <PlansStack.Screen name="EventDetail" component={EventDetailScreen} />
  </PlansStack.Navigator>
);

const ProfileStackNavigator: React.FC = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

const MainNavigator: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);
  const closeSidebar = useCallback(() => setSidebarVisible(false), []);

  return (
    <View style={styles.root}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
        tabBar={({ state, navigation }) => (
          <GlassNavbar
            tabs={TABS}
            activeIndex={state.index}
            onTabPress={(index) => {
              if (state.index !== index) {
                navigation.navigate(state.routes[index].name);
              }
            }}
          />
        )}
      >
        <Tab.Screen name="HomeTab">
          {() => <HomeStackNavigator onToggleSidebar={toggleSidebar} sidebarVisible={sidebarVisible} />}
        </Tab.Screen>
        <Tab.Screen name="ExploreTab" component={ExploreStackNavigator} />
        <Tab.Screen name="PlansTab" component={PlansStackNavigator} />
        <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
      </Tab.Navigator>

      <Sidebar visible={sidebarVisible} onClose={closeSidebar} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default MainNavigator;
