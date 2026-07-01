import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

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

const TABS = [
  {
    name: 'HomeTab' as const,
    icon: 'home' as const,
    iconOutline: 'home-outline' as const,
    activeColor: '#E43414',
  },
  {
    name: 'ExploreTab' as const,
    icon: 'search' as const,
    iconOutline: 'search-outline' as const,
    activeColor: '#E43414',
  },
  {
    name: 'PlansTab' as const,
    icon: 'list' as const,
    iconOutline: 'list-outline' as const,
    activeColor: '#E43414',
  },
  {
    name: 'ProfileTab' as const,
    icon: 'person' as const,
    iconOutline: 'person-outline' as const,
    activeColor: '#E43414',
  },
];

const MainNavigator: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);
  const closeSidebar = useCallback(() => setSidebarVisible(false), []);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={({ state, navigation }) => {
          return (
            <View style={styles.tabBarContainer}>
              <View style={styles.tabBar}>
                {TABS.map((tab, index) => {
                  const isActive = state.index === index;
                  const iconName = isActive ? tab.icon : tab.iconOutline;
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
                      {tab.name === 'ProfileTab' ? (
                        <View style={[styles.avatarRing, isActive && styles.avatarRingActive]}>
                          <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                            style={styles.tabAvatar}
                          />
                        </View>
                      ) : (
                        <Ionicons name={iconName} size={24} color={color} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        }}
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
  tabBarContainer: {
    backgroundColor: '#12161D',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 24,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  avatarRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRingActive: {
    borderColor: '#E43414',
  },
  tabAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default MainNavigator;
