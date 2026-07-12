import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../store';
import { allVibes } from '../../constants/vibes';
import { resolveImage } from '../../utils/images';
import { uploadEventImage } from '../../services/api';
import { fonts } from '../../theme/fonts';

interface HostEventFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  neighborhood: string;
  link: string;
  price: string;
}

const schema = yup.object().shape({
  title: yup.string().required('Event title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  category: yup.string().required('Event type is required'),
  date: yup.string().required('Date is required'),
  time: yup.string().required('Time is required'),
  location: yup.string().required('Location is required'),
  venue: yup.string().required('Venue name is required'),
  neighborhood: yup.string().required('Neighborhood is required'),
  link: yup.string().url('Must be a valid URL').optional(),
  price: yup.string().optional(),
});

const HostEventScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, location, submitEvent } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showVibePicker, setShowVibePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Generate date options (next 30 days)
  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Generate time options (every 30 min from 6am to midnight)
  const timeOptions = Array.from({ length: 36 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6;
    const min = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${min}`;
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<HostEventFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: '',
      description: '',
      category: '',
      date: '',
      time: '',
      location: location?.fullAddress || '',
      venue: '',
      neighborhood: location?.neighborhood || '',
      link: '',
      price: '',
    },
  });

  const selectedCategory = watch('category');
  const selectedDate = watch('date');
  const selectedTime = watch('time');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos in Settings.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets[0]) return;

    const localUri = result.assets[0].uri;
    setSelectedImageUri(localUri);
    setIsUploading(true);

    try {
      const imageUrl = await uploadEventImage(localUri);
      setSelectedImageId(imageUrl);
    } catch (err) {
      Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
      setSelectedImageUri(null);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: HostEventFormData) => {
    if (!selectedImageId) {
      Alert.alert('Image Required', 'Please select a cover image for your event.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      submitEvent({
        title: data.title,
        description: data.description,
        category: data.category,
        imageId: selectedImageId,
        image: resolveImage(selectedImageId, undefined, 'medium'),
        price: data.price ? parseFloat(data.price) : 0,
        location: data.location,
        date: data.date,
        time: data.time,
        organizer: `${user?.firstName} ${user?.lastName}`,
        organizerId: user?.id,
        venue: data.venue,
        neighborhood: data.neighborhood,
      });

      setIsSubmitting(false);
      Alert.alert(
        'Event Submitted!',
        'Your event has been submitted for review. You\'ll be notified once it\'s approved.',
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              setSelectedImageId(null);
              setSelectedImageUri(null);
              navigation.goBack();
            },
          },
        ]
      );
    }, 1500);
  };

  const renderField = (
    label: string,
    value: string,
    onChangeText: (t: string) => void,
    placeholder: string,
    error?: string,
    keyboardType: any = 'default',
    multiline = false
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          multiline && styles.fieldInputMultiline,
          error ? styles.fieldInputError : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.25)"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );

  const renderVibePicker = () => (
    <Modal visible={showVibePicker} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Event Type</Text>
            <TouchableOpacity onPress={() => setShowVibePicker(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={allVibes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.vibeItem,
                  selectedCategory === item.id && styles.vibeItemActive,
                ]}
                onPress={() => {
                  setValue('category', item.id, { shouldValidate: true });
                  setShowVibePicker(false);
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={selectedCategory === item.id ? '#E43414' : 'rgba(255,255,255,0.6)'}
                />
                <Text
                  style={[
                    styles.vibeItemText,
                    selectedCategory === item.id && styles.vibeItemTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                {selectedCategory === item.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#E43414" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderDatePicker = () => (
    <Modal visible={showDatePicker} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={dateOptions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dateItem,
                  selectedDate === item && styles.dateItemActive,
                ]}
                onPress={() => {
                  setValue('date', item, { shouldValidate: true });
                  setShowDatePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.dateItemText,
                    selectedDate === item && styles.dateItemTextActive,
                  ]}
                >
                  {item}
                </Text>
                {selectedDate === item && (
                  <Ionicons name="checkmark-circle" size={20} color="#E43414" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderTimePicker = () => (
    <Modal visible={showTimePicker} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={timeOptions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.timeItem,
                  selectedTime === item && styles.timeItemActive,
                ]}
                onPress={() => {
                  setValue('time', item, { shouldValidate: true });
                  setShowTimePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.timeItemText,
                    selectedTime === item && styles.timeItemTextActive,
                  ]}
                >
                  {item}
                </Text>
                {selectedTime === item && (
                  <Ionicons name="checkmark-circle" size={20} color="#E43414" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Host an Event</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Banner */}
            <View style={styles.banner}>
              <Ionicons name="sparkles" size={24} color="#FF6B4A" />
              <Text style={styles.bannerText}>
                Share your event with the local community
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {renderField(
                'Event Title',
                watch('title'),
                (t) => setValue('title', t, { shouldValidate: true }),
                'e.g., Jazz Night at Blue Note',
                errors.title?.message
              )}

              {/* Event Type / Vibe Picker */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Event Type</Text>
                <TouchableOpacity
                  style={[styles.pickerBtn, errors.category ? styles.fieldInputError : null]}
                  onPress={() => setShowVibePicker(true)}
                  activeOpacity={0.7}
                >
                  {selectedCategory ? (
                    <View style={styles.pickerValueRow}>
                      <Ionicons
                        name={(allVibes.find(v => v.id === selectedCategory)?.icon as any) || 'pricetag'}
                        size={18}
                        color="#FF6B4A"
                      />
                      <Text style={styles.pickerValue}>
                        {allVibes.find(v => v.id === selectedCategory)?.label}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.pickerPlaceholder}>Select event type</Text>
                  )}
                  <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
                {errors.category && <Text style={styles.fieldError}>{errors.category.message}</Text>}
              </View>

              {renderField(
                'Description',
                watch('description'),
                (t) => setValue('description', t, { shouldValidate: true }),
                'Tell people what to expect...',
                errors.description?.message,
                'default',
                true
              )}

              {/* Date & Time Row */}
              <View style={styles.row}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Date</Text>
                  <TouchableOpacity
                    style={[styles.pickerBtn, errors.date ? styles.fieldInputError : null]}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={selectedDate ? styles.pickerValue : styles.pickerPlaceholder}>
                      {selectedDate || 'Select date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                  {errors.date && <Text style={styles.fieldError}>{errors.date.message}</Text>}
                </View>

                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Time</Text>
                  <TouchableOpacity
                    style={[styles.pickerBtn, errors.time ? styles.fieldInputError : null]}
                    onPress={() => setShowTimePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={selectedTime ? styles.pickerValue : styles.pickerPlaceholder}>
                      {selectedTime || 'Select time'}
                    </Text>
                    <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                  {errors.time && <Text style={styles.fieldError}>{errors.time.message}</Text>}
                </View>
              </View>

              {/* Venue & Location */}
              {renderField(
                'Venue Name',
                watch('venue'),
                (t) => setValue('venue', t, { shouldValidate: true }),
                'e.g., Jakarta Convention Center',
                errors.venue?.message
              )}

              {renderField(
                'Neighborhood',
                watch('neighborhood'),
                (t) => setValue('neighborhood', t, { shouldValidate: true }),
                'e.g., Senayan',
                errors.neighborhood?.message
              )}

              {renderField(
                'Full Address',
                watch('location'),
                (t) => setValue('location', t, { shouldValidate: true }),
                'Street address or landmark',
                errors.location?.message
              )}

              {/* Price */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Price (IDR, optional)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={watch('price')}
                  onChangeText={(t) => setValue('price', t)}
                  placeholder="0 = Free Event"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="numeric"
                />
              </View>

              {/* Cover Image Picker */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Cover Image</Text>
                <TouchableOpacity
                  style={styles.imagePickerBtn}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <View style={styles.imagePickerContent}>
                      <Ionicons name="hourglass-outline" size={28} color="rgba(255,255,255,0.4)" />
                      <Text style={styles.imagePickerText}>Uploading...</Text>
                    </View>
                  ) : selectedImageUri ? (
                    <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
                  ) : (
                    <View style={styles.imagePickerContent}>
                      <Ionicons name="image-outline" size={28} color="rgba(255,255,255,0.4)" />
                      <Text style={styles.imagePickerText}>Tap to select cover image</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* External Link */}
              {renderField(
                'External Link (optional)',
                watch('link'),
                (t) => setValue('link', t),
                'Instagram, website, or ticketing link',
                errors.link?.message,
                'url'
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.retroSubmitOuter, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <View style={styles.retroSubmitInner}>
                {isSubmitting ? (
                  <>
                    <Ionicons name="hourglass-outline" size={18} color="#000000" />
                    <Text style={styles.retroSubmitText}>Submitting...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.retroSubmitText}>Submit for Review</Text>
                    <View style={styles.retroSubmitArrow}>
                      <Ionicons name="arrow-forward" size={12} color="#000000" />
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Events are reviewed before going live. You'll be notified once approved.
            </Text>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {renderVibePicker()}
      {renderDatePicker()}
      {renderTimePicker()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(255,107,74,0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.15)',
  },
  bannerText: {
    fontSize: 14,
    color: '#FF6B4A',
    fontWeight: '500',
    flex: 1,
  },
  // Form
  form: {
    paddingHorizontal: 20,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  fieldInputMultiline: {
    height: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  fieldInputError: {
    borderColor: '#E43414',
  },
  fieldError: {
    fontSize: 12,
    color: '#E43414',
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  // Picker Button
  pickerBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pickerValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerValue: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.25)',
  },
  // Submit Button
  submitBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FF6B4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  // Image Picker
  imagePickerBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    height: 160,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePickerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  retroSubmitOuter: {
    marginHorizontal: 20,
    marginTop: 8,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E43414',
    borderRadius: 8,
    padding: 2,
    justifyContent: 'center',
  },
  retroSubmitInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E43414',
    borderRadius: 6,
  },
  retroSubmitText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: fonts.bodyBold,
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
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
    lineHeight: 18,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  // Vibe Items
  vibeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  vibeItemActive: {
    backgroundColor: 'rgba(228,52,20,0.08)',
  },
  vibeItemText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  vibeItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  // Date Items
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  dateItemActive: {
    backgroundColor: 'rgba(228,52,20,0.08)',
  },
  dateItemText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  dateItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  // Time Items
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  timeItemActive: {
    backgroundColor: 'rgba(228,52,20,0.08)',
  },
  timeItemText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  timeItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default HostEventScreen;
