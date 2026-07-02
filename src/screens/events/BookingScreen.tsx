import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import { useAuth } from '../../store';

const { width } = Dimensions.get('window');

const ticketTypes = [
  {
    id: 'vip',
    name: 'VIP',
    price: 250,
    perks: ['Front row seating', 'Backstage access', 'Free drinks', 'Meet & Greet'],
  },
  {
    id: 'regular',
    name: 'Regular',
    price: 120,
    perks: ['Standard seating', '1 free drink', 'Event merchandise'],
  },
  {
    id: 'economy',
    name: 'Economy',
    price: 60,
    perks: ['General admission', 'Standing area'],
  },
];

const seatRows = ['A', 'B', 'C', 'D', 'E', 'F'];
const seatColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const BookingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId } = route.params;
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isPrivateRSVP, setIsPrivateRSVP] = useState(false);
  const { togglePrivateRSVP } = useAuth();

  const slideAnim = useRef(new Animated.Value(0)).current;

  const goToStep = (step: number) => {
    Animated.timing(slideAnim, {
      toValue: step > currentStep ? -width : width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(step);
      slideAnim.setValue(step > currentStep ? width : -width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const toggleSeat = (seat: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const getTicketPrice = () => {
    const ticket = ticketTypes.find((t) => t.id === selectedTicket);
    return ticket ? ticket.price : 0;
  };

  const getSubtotal = () => getTicketPrice() * quantity;
  const getFees = () => Math.round(getSubtotal() * 0.1);
  const getTotal = () => getSubtotal() + getFees();

  const takenSeats = ['A3', 'A4', 'B5', 'B6', 'C7', 'D2', 'D3', 'E8', 'E9', 'F4', 'F5'];

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                currentStep >= step && styles.stepCircleActive,
                currentStep > step && styles.stepCircleCompleted,
              ]}
            >
              {currentStep > step ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    currentStep >= step && styles.stepNumberActive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                currentStep >= step && styles.stepLabelActive,
              ]}
            >
              {step === 1 ? 'Tickets' : step === 2 ? 'Details' : step === 3 ? 'Payment' : 'Confirm'}
            </Text>
          </View>
          {step < 4 && (
            <View
              style={[
                styles.stepLine,
                currentStep > step && styles.stepLineCompleted,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose Your Ticket</Text>
      {ticketTypes.map((ticket) => (
        <TouchableOpacity
          key={ticket.id}
          style={[styles.ticketCard, selectedTicket === ticket.id && styles.ticketCardSelected]}
          onPress={() => setSelectedTicket(ticket.id)}
        >
          <GlassCard style={styles.ticketCardContent}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketName}>{ticket.name}</Text>
              <Text style={styles.ticketPrice}>${ticket.price}</Text>
            </View>
            <View style={styles.perksList}>
              {ticket.perks.map((perk, index) => (
                <View key={index} style={styles.perkRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.accent.cyan} />
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
            {selectedTicket === ticket.id && (
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Ionicons name="remove" size={20} color={colors.text.primary} />
                </TouchableOpacity>
                <Animated.Text style={styles.quantityValue}>{quantity}</Animated.Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.min(10, quantity + 1))}
                >
                  <Ionicons name="add" size={20} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Your Seats</Text>
      <GlassCard style={styles.seatGridCard}>
        <View style={styles.screenIndicator}>
          <Text style={styles.screenText}>STAGE</Text>
        </View>
        {seatRows.map((row) => (
          <View key={row} style={styles.seatRow}>
            <Text style={styles.rowLabel}>{row}</Text>
            {seatColumns.map((col) => {
              const seatId = `${row}${col}`;
              const isTaken = takenSeats.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);
              return (
                <TouchableOpacity
                  key={seatId}
                  style={[
                    styles.seat,
                    isTaken && styles.seatTaken,
                    isSelected && styles.seatSelected,
                  ]}
                  onPress={() => !isTaken && toggleSeat(seatId)}
                  disabled={isTaken}
                >
                  <Text
                    style={[
                      styles.seatText,
                      (isTaken || isSelected) && styles.seatTextLight,
                    ]}
                  >
                    {col}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </GlassCard>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendAvailable]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendSelected]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendTaken]} />
          <Text style={styles.legendText}>Taken</Text>
        </View>
      </View>
      <Text style={styles.selectedSeatsText}>
        Selected: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
      </Text>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      <View style={styles.paymentMethods}>
        {[
          { id: 'credit_card', label: 'Credit Card', icon: 'card-outline' },
          { id: 'bank_transfer', label: 'Bank Transfer', icon: 'business-outline' },
          { id: 'ewallet', label: 'E-Wallet', icon: 'wallet-outline' },
        ].map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              paymentMethod === method.id && styles.paymentMethodSelected,
            ]}
            onPress={() => setPaymentMethod(method.id)}
          >
            <Ionicons name={method.icon as any} size={24} color={colors.text.primary} />
            <Text style={styles.paymentMethodLabel}>{method.label}</Text>
            {paymentMethod === method.id && (
              <Ionicons name="checkmark-circle" size={20} color={colors.accent.cyan} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {paymentMethod === 'credit_card' && (
        <GlassCard style={styles.cardForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={colors.text.muted}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.inputLabel}>Expiry</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor={colors.text.muted}
                value={expiry}
                onChangeText={setExpiry}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor={colors.text.muted}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </GlassCard>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ticket Type</Text>
            <Text style={styles.summaryValue}>
              {ticketTypes.find((t) => t.id === selectedTicket)?.name || '-'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantity</Text>
            <Text style={styles.summaryValue}>{quantity}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${getSubtotal()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>${getFees()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>${getTotal()}</Text>
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
      <View style={styles.successContainer}>
        <View style={styles.successCircle}>
          <LinearGradient
            colors={[colors.accent.cyan, colors.accent.orange]}
            style={styles.successGradient}
          >
            <Ionicons name="checkmark" size={64} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>Your ticket has been booked successfully</Text>
      </View>

      <GlassCard style={styles.qrCard}>
        <View style={styles.qrPlaceholder}>
          <LinearGradient
            colors={[colors.accent.cyan, colors.accent.orange]}
            style={styles.qrGradient}
          >
            <Text style={styles.qrText}>QR</Text>
          </LinearGradient>
        </View>
        <Text style={styles.qrHint}>Show this QR code at the venue entrance</Text>
      </GlassCard>

      <GlassCard style={styles.bookingDetailsCard}>
        <View style={styles.bookingDetailRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.text.muted} />
          <Text style={styles.bookingDetailText}>Dec 15, 2024 • 7:00 PM</Text>
        </View>
        <View style={styles.bookingDetailRow}>
          <Ionicons name="location-outline" size={20} color={colors.accent.cyan} />
          <Text style={[styles.bookingDetailText, { color: colors.accent.cyan }]}>Central Park Arena</Text>
        </View>
        <View style={styles.bookingDetailRow}>
          <Ionicons name="ticket-outline" size={20} color={colors.text.muted} />
          <Text style={styles.bookingDetailText}>
            {ticketTypes.find((t) => t.id === selectedTicket)?.name} x{quantity}
          </Text>
        </View>
      </GlassCard>

      {/* Privacy Toggle */}
      <GlassCard style={styles.privacyCard}>
        <View style={styles.privacyRow}>
          <View style={styles.privacyLeft}>
            <Ionicons name="eye-off-outline" size={20} color="rgba(255,255,255,0.6)" />
            <View>
              <Text style={styles.privacyLabel}>Keep this RSVP private</Text>
              <Text style={styles.privacySub}>Friends won't see this in your activity</Text>
            </View>
          </View>
          <Switch
            value={isPrivateRSVP}
            onValueChange={(val) => {
              setIsPrivateRSVP(val);
              togglePrivateRSVP(eventId);
            }}
            trackColor={{ false: 'rgba(255,255,255,0.12)', true: '#FF6B4A' }}
            thumbColor={isPrivateRSVP ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
            ios_backgroundColor="rgba(255,255,255,0.12)"
          />
        </View>
      </GlassCard>

      <View style={styles.actionButtons}>
        <GradientButton title="Download Ticket" onPress={() => {}} style={styles.actionButton} />
        <TouchableOpacity style={styles.walletButton}>
          <Ionicons name="wallet-outline" size={20} color={colors.accent.cyan} />
          <Text style={styles.walletButtonText}>Add to Wallet</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backToHomeButton}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.backToHomeText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentStep === 1 ? 'Tickets' : currentStep === 2 ? 'Select Seats' : currentStep === 3 ? 'Payment' : 'Confirmation'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {renderStepIndicator()}

      <Animated.View
        style={[styles.stepContainer, { transform: [{ translateX: slideAnim }] }]}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </Animated.View>

      {currentStep < 4 && (
        <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
          <GradientButton
            title={currentStep === 3 ? `Pay $${getTotal()}` : 'Continue'}
            onPress={handleNext}
            disabled={currentStep === 1 && !selectedTicket}
          />
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090B10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
    fontFamily: fonts.subheading,
  },
  headerSpacer: {
    width: 44,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass.medium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stepCircleActive: {
    backgroundColor: colors.accent.cyan,
    borderColor: colors.accent.cyan,
  },
  stepCircleCompleted: {
    backgroundColor: colors.accent.cyan,
    borderColor: colors.accent.cyan,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.muted,
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 6,
    fontFamily: fonts.body,
  },
  stepLabelActive: {
    color: colors.text.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  stepLineCompleted: {
    backgroundColor: colors.accent.cyan,
  },
  stepContainer: {
    flex: 1,
  },
  stepContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: 120,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.lg,
    fontFamily: fonts.heading,
  },
  ticketCard: {
    marginBottom: 16,
  },
  ticketCardSelected: {
    borderColor: colors.accent.cyan,
    borderWidth: 2,
    borderRadius: 20,
  },
  ticketCardContent: {
    padding: 20,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketName: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text.primary,
    fontFamily: fonts.subheading,
  },
  ticketPrice: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.accent.cyan,
    fontFamily: fonts.bodyBold,
  },
  perksList: {
    gap: 10,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: fonts.body,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 24,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass.medium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  seatGridCard: {
    padding: 20,
    marginBottom: 16,
  },
  screenIndicator: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  screenText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.muted,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rowLabel: {
    width: 24,
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
  },
  seat: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
  },
  seatTaken: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  seatSelected: {
    backgroundColor: colors.accent.cyan,
  },
  seatText: {
    fontSize: 10,
    color: colors.text.muted,
    fontFamily: fonts.body,
  },
  seatTextLight: {
    color: '#fff',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendAvailable: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  legendSelected: {
    backgroundColor: colors.accent.cyan,
  },
  legendTaken: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  legendText: {
    fontSize: 12,
    color: colors.text.muted,
    fontFamily: fonts.body,
  },
  selectedSeatsText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  paymentMethods: {
    gap: 12,
    marginBottom: 24,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.medium,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  paymentMethodSelected: {
    borderColor: colors.accent.cyan,
  },
  paymentMethodLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: fonts.body,
  },
  cardForm: {
    padding: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 8,
    fontFamily: fonts.body,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    color: colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    fontFamily: fonts.body,
  },
  inputRow: {
    flexDirection: 'row',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 12,
    fontFamily: fonts.subheading,
  },
  summaryCard: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.muted,
    fontFamily: fonts.body,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: fonts.bodyBold,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    fontFamily: fonts.subheading,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.accent.cyan,
    fontFamily: fonts.bodyBold,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successCircle: {
    marginBottom: 20,
  },
  successGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
    fontFamily: fonts.heading,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  qrCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  qrPlaceholder: {
    marginBottom: 16,
  },
  qrGradient: {
    width: 180,
    height: 180,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 32,
    fontWeight: '500',
    color: '#fff',
  },
  qrHint: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  bookingDetailsCard: {
    padding: 20,
    marginBottom: 24,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  bookingDetailText: {
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
    fontFamily: fonts.body,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 0,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent.cyan,
  },
  walletButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.accent.cyan,
    fontFamily: fonts.bodyBold,
  },
  backToHomeButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backToHomeText: {
    fontSize: 16,
    color: colors.text.muted,
    fontFamily: fonts.body,
  },
  privacyCard: {
    padding: 16,
    marginBottom: 20,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  privacyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    fontFamily: fonts.bodyBold,
  },
  privacySub: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
    fontFamily: fonts.body,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});

export default BookingScreen;
