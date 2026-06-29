import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, fontSizes, fontWeights } from '../../theme/spacing';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  seeAllText?: string;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onSeeAll,
  seeAllText = 'View All',
  style,
  icon,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleRow}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={colors.accent.cyan}
            style={styles.icon}
          />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={styles.seeAll}>{seeAllText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  seeAll: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.accent.cyan,
  },
});

export default SectionHeader;