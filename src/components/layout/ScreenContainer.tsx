import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  safeArea?: boolean;
  padding?: boolean;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  scrollable = true,
  safeArea = true,
  padding = true,
}) => {
  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        padding && styles.paddingHorizontal,
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.viewContent,
        padding && styles.paddingHorizontal,
      ]}
    >
      {children}
    </View>
  );

  if (safeArea) {
    return (
      <SafeAreaView style={[styles.container, style]}>
        {content}
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  viewContent: {
    flex: 1,
  },
  paddingHorizontal: {
    paddingHorizontal: spacing.xl,
  },
});

export default ScreenContainer;