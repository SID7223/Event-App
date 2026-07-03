import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Ticket } from '../../types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/spacing';

interface TicketCardProps {
  ticket: Ticket;
  onPress: () => void;
  style?: ViewStyle;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onPress, style }) => {
  const getStatusColor = () => {
    switch (ticket.status) {
      case 'upcoming':
        return colors.accent.cyan;
      case 'cancelled':
        return colors.accent.red;
      default:
        return colors.text.muted;
    }
  };

  const getStatusLabel = () => {
    return ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {ticket.eventId}
              </Text>
              <Text style={styles.date}>{formatDate(ticket.purchaseDate)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusLabel()}
              </Text>
            </View>
          </View>

          <View style={styles.dashedLine}>
            <View style={styles.dashLeft} />
            <View style={styles.dashCircleLeft} />
            <View style={styles.dashCenter} />
            <View style={styles.dashCircleRight} />
            <View style={styles.dashRight} />
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>Type</Text>
                <Text style={styles.ticketValue}>{ticket.type}</Text>
              </View>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>Price</Text>
                <Text style={styles.ticketValue}>Rs. {ticket.price.toLocaleString('en-PK')}</Text>
              </View>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>Seat</Text>
                <Text style={styles.ticketValue}>{ticket.seat}</Text>
              </View>
            </View>

            <View style={styles.qrContainer}>
              <LinearGradient
                colors={[colors.gradient.cyan[0], colors.gradient.primary[1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.qrGradient}
              >
                <View style={styles.qrInner}>
                  <Text style={styles.qrText}>QR</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  gradientBorder: {
    padding: 1,
  },
  card: {
    backgroundColor: 'rgba(26,32,42,0.9)',
    borderRadius: borderRadius.xl - 1,
    padding: spacing.lg,
    height: 180,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  eventTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
  dashedLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dashLeft: {
    flex: 1,
    height: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  dashCircleLeft: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.background.primary,
    marginLeft: -18,
  },
  dashCenter: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  dashCircleRight: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.background.primary,
    marginRight: -18,
  },
  dashRight: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xl,
  },
  ticketInfo: {
    gap: 2,
  },
  ticketLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
  },
  ticketValue: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
  },
  qrContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  qrGradient: {
    flex: 1,
    padding: 1,
  },
  qrInner: {
    flex: 1,
    backgroundColor: 'rgba(26,32,42,0.9)',
    borderRadius: borderRadius.md - 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.text.muted,
  },
});

export default TicketCard;