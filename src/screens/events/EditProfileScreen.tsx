import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../store';
import { uploadAvatar } from '../../services/api';

const INTERESTS = ['Music', 'Art', 'Tech', 'Festival'];

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser, setLocation } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || 'John');
  const [lastName, setLastName] = useState(user?.lastName || 'Doe');
  const [email, setEmail] = useState(user?.email || 'johndoe@example.com');
  const [phone, setPhone] = useState(user?.phone || '+62 812 3455 7890');
  const [gender, setGender] = useState(user?.gender || '');
  const [locationText, setLocationText] = useState(user?.location?.city || 'Jakarta');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests || ['Music', 'Art', 'Tech', 'Festival']
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleCameraPress = () => {
    Alert.alert('Change Photo', 'Choose an option', [
      {
        text: 'Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photos in Settings.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            const localUri = result.assets[0].uri;
            try {
              const avatarUrl = await uploadAvatar(localUri);
              if (user) {
                useAuth.getState().setUser({ ...user, avatar: avatarUrl, avatarUrl: avatarUrl });
              }
            } catch (err: any) {
              Alert.alert('Upload Failed', err.message);
            }
          }
        },
      },
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow camera access in Settings.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            const localUri = result.assets[0].uri;
            try {
              const avatarUrl = await uploadAvatar(localUri);
              if (user) {
                useAuth.getState().setUser({ ...user, avatar: avatarUrl, avatarUrl: avatarUrl });
              }
            } catch (err: any) {
              Alert.alert('Upload Failed', err.message);
            }
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'Required';
    if (!lastName.trim()) newErrors.lastName = 'Required';
    if (!email.trim()) newErrors.email = 'Email required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      const updatedUser = {
        ...user!,
        firstName,
        lastName,
        email,
        phone,
        gender: (gender as 'male' | 'female' | 'other') || undefined,
        interests: selectedInterests,
        location: {
          city: locationText,
          latitude: user?.location?.latitude ?? -6.2088,
          longitude: user?.location?.longitude ?? 106.8456,
          country: user?.location?.country ?? 'Indonesia',
          fullAddress: locationText,
        },
      };
      setUser(updatedUser);
      setLocation({
        city: locationText,
        latitude: user?.location?.latitude ?? -6.2088,
        longitude: user?.location?.longitude ?? 106.8456,
        country: user?.location?.country ?? 'Indonesia',
        fullAddress: locationText,
      });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const renderField = (
    label: string,
    value: string,
    onChangeText: (t: string) => void,
    keyboardType: any = 'default',
    error?: string
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, error ? styles.fieldInputError : null]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="rgba(255,255,255,0.3)"
        autoCapitalize="none"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>✏ Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraBtn} onPress={handleCameraPress}>
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <TextInput
                style={[styles.fieldInput, errors.firstName ? styles.fieldInputError : null]}
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput
                style={[styles.fieldInput, errors.lastName ? styles.fieldInputError : null]}
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>
          </View>

          {renderField('Email', email, setEmail, 'email-address', errors.email)}
          {renderField('Phone Number', phone, setPhone, 'phone-pad')}
          {renderField('City', locationText, setLocationText)}

          {/* Gender */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {['male', 'female', 'other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderChip, gender === g && styles.genderChipActive]}
                  onPress={() => setGender(gender === g ? '' : g)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genderChipText, gender === g && styles.genderChipTextActive]}>
                    {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '⚧ Other'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interests */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Interests</Text>
            <View style={styles.interestsRow}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestChip,
                    selectedInterests.includes(interest) && styles.interestChipActive,
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text
                    style={[
                      styles.interestText,
                      selectedInterests.includes(interest) && styles.interestTextActive,
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.interestChip}>
                <Text style={styles.interestText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.88}
            style={styles.saveBtn}
          >
            <LinearGradient
              colors={['#FF6B4A', '#E43414']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGradient}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#FF6B4A',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B4A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
    fontWeight: '500',
  },
  fieldInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  fieldInputError: {
    borderColor: '#E43414',
  },
  errorText: {
    fontSize: 12,
    color: '#E43414',
    marginTop: 4,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  genderChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  genderChipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  genderChipTextActive: {
    color: '#000000',
    fontWeight: '500',
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  interestChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  interestText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  interestTextActive: {
    color: '#000000',
    fontWeight: '500',
  },
  saveBtn: {
    marginTop: 28,
    borderRadius: 28,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

export default EditProfileScreen;
