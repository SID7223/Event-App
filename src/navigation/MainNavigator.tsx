import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/main/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import MyPlansScreen from '../screens/main/MyPlansScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import EditProfileScreen from '../screens/events/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import Sidebar from '../components/layout/Sidebar';
import GlassNavbar from '../components/ui/GlassNavbar';

type TabName = 'HomeTab' | 'ExploreTab' | 'PlansTab' | 'ProfileTab';

const TABS = [
  { name: 'HomeTab' as const, icon: 'home' as const, iconOutline: 'home-outline' as const },
  { name: 'ExploreTab' as const, icon: 'compass' as const, iconOutline: 'compass-outline' as const },
  { name: 'PlansTab' as const, icon: 'calendar' as const, iconOutline: 'calendar-outline' as const },
  { name: 'ProfileTab' as const, icon: 'person' as const, iconOutline: 'person-outline' as const },
];

const MainNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('HomeTab');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);
  const closeSidebar = useCallback(() => setSidebarVisible(false), []);

  const renderScreen = () => {
    switch (activeTab) {
      case 'HomeTab':
        return <HomeScreen onOpenSidebar={toggleSidebar} sidebarVisible={sidebarVisible} />;
      case 'ExploreTab':
        return <ExploreScreen />;
      case 'PlansTab':
        return <MyPlansScreen />;
      case 'ProfileTab':
        return <ProfileScreen />;
      default:
        return <HomeScreen onOpenSidebar={toggleSidebar} sidebarVisible={sidebarVisible} />;
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
      />

      <Sidebar visible={sidebarVisible} onClose={closeSidebar} />
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
