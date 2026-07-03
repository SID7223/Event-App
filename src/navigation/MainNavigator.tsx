import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/main/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import FriendsScreen from '../screens/social/FriendsScreen';
import MyPlansScreen from '../screens/main/MyPlansScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import EditProfileScreen from '../screens/events/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import GlassNavbar from '../components/ui/GlassNavbar';
import { useApp } from '../store';
import { getTimeOfDay, GRADIENT_MAP } from '../utils/weather';

type TabName = 'HomeTab' | 'ExploreTab' | 'FriendsTab' | 'PlansTab' | 'ProfileTab';

const TABS = [
  { name: 'HomeTab' as const, icon: 'home' as const, iconOutline: 'home-outline' as const },
  { name: 'ExploreTab' as const, icon: 'compass' as const, iconOutline: 'compass-outline' as const },
  { name: 'FriendsTab' as const, icon: 'people' as const, iconOutline: 'people-outline' as const },
  { name: 'PlansTab' as const, icon: 'calendar' as const, iconOutline: 'calendar-outline' as const },
  { name: 'ProfileTab' as const, icon: 'person' as const, iconOutline: 'person-outline' as const },
];

const MainNavigator: React.FC = () => {
  const activeTab = useApp((s) => s.activeTab);
  const setActiveTab = useApp((s) => s.setActiveTab);

  const renderScreen = () => {
    switch (activeTab) {
      case 'HomeTab':
        return <HomeScreen />;
      case 'ExploreTab':
        return <ExploreScreen />;
      case 'FriendsTab':
        return <FriendsScreen />;
      case 'PlansTab':
        return <MyPlansScreen />;
      case 'ProfileTab':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {renderScreen()}
      </View>

      <GlassNavbar
        tabs={TABS}
        activeIndex={TABS.findIndex(t => t.name === activeTab)}
        onTabPress={(index) => setActiveTab(TABS[index].name)}
        gradientColors={GRADIENT_MAP[getTimeOfDay()]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default MainNavigator;
