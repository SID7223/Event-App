import React from 'react';
// Triggering TS Server re-evaluation of imports
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/main/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import MyEventsScreen from '../screens/main/MyEventsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import CalendarScreen from '../screens/events/CalendarScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import EditProfileScreen from '../screens/events/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

export type MainTabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  MyEventsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator();
const ExploreStack = createStackNavigator();
const MyEventsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    <HomeStack.Screen name="Calendar" component={CalendarScreen} />
    <HomeStack.Screen name="EventDetail" component={EventDetailScreen} />
  </HomeStack.Navigator>
);

const ExploreStackNavigator: React.FC = () => (
  <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
    <ExploreStack.Screen name="Explore" component={ExploreScreen} />
    <ExploreStack.Screen name="EventDetail" component={EventDetailScreen} />
  </ExploreStack.Navigator>
);

const MyEventsStackNavigator: React.FC = () => (
  <MyEventsStack.Navigator screenOptions={{ headerShown: false }}>
    <MyEventsStack.Screen name="MyEvents" component={MyEventsScreen} />
    <MyEventsStack.Screen name="EventDetail" component={EventDetailScreen} />
  </MyEventsStack.Navigator>
);

const ProfileStackNavigator: React.FC = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  {
    name: 'HomeTab' as const,
    label: 'Home',
    activeIcon: 'home' as const,
    inactiveIcon: 'home-outline' as const,
    activeColor: '#FFFFFF',
  },
  {
    name: 'ExploreTab' as const,
    label: 'Explore',
    activeIcon: 'search' as const,
    inactiveIcon: 'search-outline' as const,
    activeColor: '#FFFFFF',
  },
  {
    name: 'MyEventsTab' as const,
    label: 'My Events',
    activeIcon: 'calendar' as const,
    inactiveIcon: 'calendar-outline' as const,
    activeColor: '#FFFFFF',
  },
  {
    name: 'ProfileTab' as const,
    label: 'Profile',
    activeIcon: 'person' as const,
    inactiveIcon: 'person-outline' as const,
    activeColor: '#FFFFFF',
  },
];

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => {
        return (
          <View style={styles.tabBarContainer}>
            <View style={styles.tabBar}>
              {TABS.map((tab, index) => {
                const isActive = state.index === index;
                const color = isActive ? tab.activeColor : 'rgba(255,255,255,0.4)';

                const onPress = () => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: state.routes[index].key,
                    canPreventDefault: true,
                  });
                  if (!isActive && !event.defaultPrevented) {
                    navigation.navigate(tab.name);
                  }
                };

                return (
                  <TouchableOpacity
                    key={tab.name}
                    style={styles.tabItem}
                    onPress={onPress}
                    activeOpacity={0.7}
                  >
                    {/* Active indicator dot above icon */}
                    {isActive && tab.name === 'HomeTab' && (
                      <View style={[styles.activeDot, { backgroundColor: tab.activeColor }]} />
                    )}

                    <Ionicons
                      name={isActive ? tab.activeIcon : tab.inactiveIcon}
                      size={24}
                      color={color}
                    />
                    <Text
                      style={[
                        styles.tabLabel,
                        { color, fontWeight: isActive ? '600' : '400' },
                      ]}
                    >
                      {tab.label}
                    </Text>

                    {/* Underline for Explore when active */}
                    {isActive && tab.name === 'ExploreTab' && (
                      <View style={[styles.underline, { backgroundColor: tab.activeColor }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="ExploreTab" component={ExploreStackNavigator} />
      <Tab.Screen name="MyEventsTab" component={MyEventsStackNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#12161D',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    paddingBottom: 24,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
  },
  activeDot: {
    position: 'absolute',
    top: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  underline: {
    position: 'absolute',
    bottom: -4,
    width: 24,
    height: 2,
    borderRadius: 1,
  },
});

export default MainNavigator;
