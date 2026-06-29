import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#99E1D9',
    background: '#0A0C12',
    card: '#161B24',
    text: '#FFFFFF',
    border: 'rgba(255,255,255,0.07)',
    notification: '#E43414',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={DarkTheme}>
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
