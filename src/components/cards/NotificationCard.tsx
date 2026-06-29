import React, { useRef } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../../types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/spacing';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onDelete: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onDelete,
  onLongPress,
  style,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
          deleteOpacity.setValue(Math.min(gestureState.dx / 100, 1));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          Animated.timing(translateX, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDelete();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.spring(deleteOpacity, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (notification.type) {
      case 'booking':
        return 'ticket-outline';
      case 'reminder':
        return 'alarm-outline';
      case 'update':
        return 'information-circle-outline';
      case 'promotion':
        return 'pricetag-outline';
      default:
        return 'notifications-outline';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[styles.deleteBackground, { opacity: deleteOpacity }]}
      >
        <Ionicons name="trash-outline" size={24} color={colors.text.primary} />
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.card,
          !notification.read && styles.unreadCard,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onLongPress={onLongPress}
          style={styles.content}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
            <Ionicons name={getIconName()} size={20} color={getIconColor()} />
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[styles.title, !notification.read && styles.unreadTitle]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {notification.message}
            </Text>
          </View>

          <Text style={styles.time}>{notification.time}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  function getIconColor(): string {
    switch (notification.type) {
      case 'booking':
        return colors.accent.cyan;
      case 'reminder':
        return colors.accent.orange;
      case 'update':
        return colors.accent.blue;
      case 'promotion':
        return colors.accent.purple;
      default:
        return colors.accent.cyan;
    }
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.accent.red,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: spacing.xl,
    gap: spacing.sm,
  },
  deleteText: {
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.md,
  },
  card: {
    backgroundColor: 'rgba(26,32,42,0.8)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.cyan,
    backgroundColor: 'rgba(26,32,42,0.95)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  unreadTitle: {
    fontWeight: fontWeights.bold,
  },
  message: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  time: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    textAlign: 'right',
  },
});

export default NotificationCard;