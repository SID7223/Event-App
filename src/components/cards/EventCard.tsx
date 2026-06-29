import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/spacing';
import PriceBadge from '../ui/PriceBadge';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  variant?: 'horizontal' | 'vertical' | 'featured';
  style?: ViewStyle;
  width?: number;
  height?: number;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  variant = 'vertical',
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const [isFavorite, setIsFavorite] = React.useState(event.isFavorite);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handleFavoritePress = () => {
    setIsFavorite(!isFavorite);
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.3,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderInfo = (compact: boolean = false) => (
    <View style={[styles.infoContainer, compact && styles.infoCompact]}>
      <Text
        style={[styles.title, compact && styles.titleCompact]}
        numberOfLines={compact ? 1 : 2}
      >
        {event.title}
      </Text>
      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={compact ? 10 : 12} color={colors.text.muted} />
        <Text style={[styles.metaText, compact && styles.metaTextCompact]}>
          {formatDate(event.date)}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={compact ? 10 : 12} color={colors.text.muted} />
        <Text style={[styles.metaText, compact && styles.metaTextCompact]} numberOfLines={1}>
          {event.location}
        </Text>
      </View>
      {!compact && <PriceBadge price={event.price} style={styles.priceBadge} />}
    </View>
  );

  const renderFavoriteButton = (topRight: boolean = false) => (
    <TouchableOpacity
      onPress={handleFavoritePress}
      style={[styles.heartButton, topRight && styles.heartButtonAbsolute]}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: heartScale }] }}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={isFavorite ? colors.accent.red : colors.text.primary}
        />
      </Animated.View>
    </TouchableOpacity>
  );

  const renderHorizontal = () => (
    <View style={styles.horizontalContainer}>
      <Image source={{ uri: event.image }} style={styles.horizontalImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.horizontalImageOverlay}
      />
      {renderInfo(true)}
      {renderFavoriteButton()}
    </View>
  );

  const renderVertical = () => (
    <View style={styles.verticalContainer}>
      <Image source={{ uri: event.image }} style={styles.verticalImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.verticalImageOverlay}
      />
      <View style={styles.verticalInfoOverlay}>
        <PriceBadge price={event.price} style={styles.verticalPrice} />
        {renderFavoriteButton()}
      </View>
      {renderInfo()}
    </View>
  );

  const renderFeatured = () => (
    <View style={styles.featuredContainer}>
      <Image source={{ uri: event.image }} style={styles.featuredImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.4, 1]}
        style={styles.featuredGradient}
      />
      <View style={styles.featuredInfo}>
        {renderInfo()}
      </View>
      {renderFavoriteButton(true)}
    </View>
  );

  const renderContent = () => {
    switch (variant) {
      case 'horizontal':
        return renderHorizontal();
      case 'featured':
        return renderFeatured();
      default:
        return renderVertical();
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.card,
          variant === 'horizontal' && styles.horizontalCard,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  horizontalCard: {
    flexDirection: 'row',
    height: 120,
  },
  horizontalContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  horizontalImage: {
    width: 120,
    height: '100%',
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
  },
  horizontalImageOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 120,
    height: '100%',
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
  },
  verticalContainer: {
    position: 'relative',
  },
  verticalImage: {
    width: '100%',
    height: 160,
  },
  verticalImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  verticalInfoOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  verticalPrice: {
    alignSelf: 'auto',
  },
  featuredContainer: {
    height: 280,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  featuredInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  infoContainer: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  infoCompact: {
    padding: spacing.sm,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  titleCompact: {
    fontSize: fontSizes.md,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 3,
  },
  metaText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    flex: 1,
  },
  metaTextCompact: {
    fontSize: fontSizes.xs,
  },
  priceBadge: {
    marginTop: spacing.sm,
  },
  heartButton: {
    padding: spacing.sm,
  },
  heartButtonAbsolute: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: borderRadius.full,
    padding: spacing.xs + 2,
  },
});

export default EventCard;