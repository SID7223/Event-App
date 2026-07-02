import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../theme/fonts';

interface ClaimVenueModalProps {
  visible: boolean;
  onClose: () => void;
  venueName: string;
}

const ROLES = ['Owner', 'Manager', 'Authorized Representative'];

const ClaimVenueModal: React.FC<ClaimVenueModalProps> = ({ visible, onClose, venueName }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const resetForm = () => {
    setName('');
    setRole('');
    setContact('');
    setContactType('email');
    setShowRolePicker(false);
    setSubmitted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    if (!role) {
      Alert.alert('Required', 'Please select your role.');
      return;
    }
    if (!contact.trim()) {
      Alert.alert('Required', `Please enter your business ${contactType === 'email' ? 'email' : 'phone number'}.`);
      return;
    }

    // Simulate submission
    setSubmitted(true);
  };

  const isFormValid = name.trim().length > 0 && role.length > 0 && contact.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={handleClose} />
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Claim This Venue</Text>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerSubtitle}>
              Verify your ownership of <Text style={styles.venueHighlight}>{venueName}</Text> to manage your listing.
            </Text>
          </View>

          {submitted ? (
            /* Success State */
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
              </View>
              <Text style={styles.successTitle}>Request Submitted!</Text>
              <Text style={styles.successText}>
                Our team will review your claim and reach out within 24-48 hours via {contactType === 'email' ? 'email' : 'phone'}.
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose} activeOpacity={0.8}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Form */
            <ScrollView
              contentContainerStyle={styles.form}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Budi Santoso"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Role */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Your Role</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowRolePicker(!showRolePicker)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.selectText, !role && styles.selectPlaceholder]}>
                    {role || 'Select your role'}
                  </Text>
                  <Ionicons
                    name={showRolePicker ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="rgba(255,255,255,0.4)"
                  />
                </TouchableOpacity>
                {showRolePicker && (
                  <View style={styles.dropdown}>
                    {ROLES.map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.dropdownItem, role === r && styles.dropdownItemActive]}
                        onPress={() => { setRole(r); setShowRolePicker(false); }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.dropdownText, role === r && styles.dropdownTextActive]}>
                          {r}
                        </Text>
                        {role === r && <Ionicons name="checkmark" size={16} color="#FF6B4A" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Contact Type Toggle */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Contact Method</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, contactType === 'email' && styles.toggleBtnActive]}
                    onPress={() => setContactType('email')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="mail-outline" size={16} color={contactType === 'email' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'} />
                    <Text style={[styles.toggleText, contactType === 'email' && styles.toggleTextActive]}>Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, contactType === 'phone' && styles.toggleBtnActive]}
                    onPress={() => setContactType('phone')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call-outline" size={16} color={contactType === 'phone' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'} />
                    <Text style={[styles.toggleText, contactType === 'phone' && styles.toggleTextActive]}>Phone</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Contact Value */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Business {contactType === 'email' ? 'Email' : 'Phone Number'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={contactType === 'email' ? 'e.g. contact@venue.com' : 'e.g. +62 812 3456 7890'}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={contact}
                  onChangeText={setContact}
                  keyboardType={contactType === 'email' ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.retroSubmitOuter, !isFormValid && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!isFormValid}
                activeOpacity={0.8}
              >
                <View style={styles.retroSubmitInner}>
                  <Text style={styles.retroSubmitText}>Submit Claim Request</Text>
                  <View style={styles.retroSubmitArrow}>
                    <Ionicons name="arrow-forward" size={12} color="#0A0C12" />
                  </View>
                </View>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                By submitting, you confirm that you are authorized to represent this business. Our team will verify your claim within 24-48 hours.
              </Text>
            </ScrollView>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  venueHighlight: {
    color: '#FF6B4A',
    fontWeight: '500',
    fontFamily: fonts.bodyBold,
  },
  // Form
  form: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    fontFamily: fonts.body,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  selectText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: fonts.body,
  },
  selectPlaceholder: {
    color: 'rgba(255,255,255,0.25)',
    fontFamily: fonts.body,
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(255,107,74,0.08)',
  },
  dropdownText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.body,
  },
  dropdownTextActive: {
    color: '#FF6B4A',
    fontWeight: '500',
    fontFamily: fonts.bodyBold,
  },
  // Contact toggle
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(255,107,74,0.15)',
    borderColor: 'rgba(255,107,74,0.3)',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.bodyBold,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
  },
  // Submit
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FF6B4A',
    marginTop: 8,
    marginBottom: 12,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(255,107,74,0.2)',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A0C12',
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  retroSubmitOuter: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#FFF44F',
    borderRadius: 8,
    padding: 2,
    marginTop: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  retroSubmitInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF44F',
    borderRadius: 6,
  },
  retroSubmitText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A0C12',
    fontFamily: fonts.bodyBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  retroSubmitArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    lineHeight: 16,
    paddingBottom: 8,
    fontFamily: fonts.body,
  },
  // Success
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: fonts.heading,
  },
  successText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    fontFamily: fonts.body,
  },
  doneBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FF6B4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A0C12',
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

export default ClaimVenueModal;
