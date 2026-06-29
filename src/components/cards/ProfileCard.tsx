import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/spacing';

interface ProfileCardProps {
  user: User;
  style?: ViewStyle;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, style }) => {
  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientBorder, style]}
    >
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.onlineIndicator} />
        </View>

        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.handle}>@{user.firstName.toLowerCase()}{user.lastName.toLowerCase()}</Text>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: borderRadius.xxl,
    padding: 1,
  },
  card: {
    backgroundColor: 'rgba(26,32,42,0.9)',
    borderRadius: borderRadius.xxl - 1,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent.green,
    borderWidth: 3,
    borderColor: colors.background.card,
  },
  name: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  handle: {
    fontSize: fontSizes.md,
    color: colors.text.muted,
    marginBottom: spacing.lg,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.light,
  },
});

export default ProfileCard;