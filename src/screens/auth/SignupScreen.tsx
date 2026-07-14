import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import { signup as apiSignup, login as apiLogin } from '../../services/api';
import { useAuth } from '../../store';

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'Required';
    if (!lastName.trim()) newErrors.lastName = 'Required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email';
    if (!phone.trim()) newErrors.phone = 'Phone is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Min 8 characters';
    else if (!/[A-Z]/.test(password)) newErrors.password = 'Must contain an uppercase letter';
    else if (!/[a-z]/.test(password)) newErrors.password = 'Must contain a lowercase letter';
    else if (!/[0-9]/.test(password)) newErrors.password = 'Must contain a number';
    if (!agreedToTerms) newErrors.terms = 'Please agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { loginWithTokens } = useAuth();

  const handleSignup = async () => {
    if (!validate()) return;
    try {
      const authData = await apiSignup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        gender: (gender as 'male' | 'female' | 'other') || undefined,
      });
      loginWithTokens(authData.accessToken, authData.refreshToken, authData.accessTokenExpiresAt, authData.user);
      
      const user = authData.user;
      const hasLocation = user.location?.city || user.city;
      const hasPreferences = user.preferences?.length > 0 || user.interests?.length > 0;
      const userCompletedOnboarding = !!(hasLocation && hasPreferences);
      if (userCompletedOnboarding) {
        return;
      }
      navigation.navigate('LocationStep', { user });

    } catch (err: any) {
      if (err.message?.toLowerCase().includes('already exists')) {
        try {
          const authData = await apiLogin(email.trim(), password);
          loginWithTokens(authData.accessToken, authData.refreshToken, authData.accessTokenExpiresAt, authData.user);
          
          const existingUser = authData.user;
          const existingHasLocation = existingUser.location?.city || existingUser.city;
          const existingHasPrefs = existingUser.preferences?.length > 0 || existingUser.interests?.length > 0;
          const existingCompletedOnboarding = !!(existingHasLocation && existingHasPrefs);
          
          if (existingCompletedOnboarding) {
            return;
          }
          navigation.navigate('LocationStep', { user: existingUser });
          return;
        } catch {
          setErrors({ email: 'An account with this email already exists. Please try logging in.' });
        }
      } else {
        setErrors({ email: err.message || 'Signup failed' });
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
            </View>

            {/* Name row */}
            <View style={styles.nameRow}>
              <View style={[styles.inputWrapper, styles.halfInput, errors.firstName ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoComplete="off"
                  textContentType="none"
                />
              </View>
              <View style={[styles.inputWrapper, styles.halfInput, errors.lastName ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={lastName}
                  onChangeText={setLastName}
                  autoComplete="off"
                  textContentType="none"
                />
              </View>
            </View>
            {(errors.firstName || errors.lastName) && (
              <Text style={styles.errorText}>First and last name are required</Text>
            )}

            {/* Email */}
            <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Phone */}
            <View style={[styles.inputWrapper, errors.phone ? styles.inputError : null]}>
              <TextInput
                style={styles.input}
                placeholder="Phone Number (optional)"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="off"
                textContentType="none"
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            {/* Gender */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Gender (optional)</Text>
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

            {/* Password */}
            <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="off"
                textContentType="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {/* Terms */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                style={styles.termsCheckArea}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                  {agreedToTerms && (
                    <Ionicons name="checkmark" size={14} color="#000000" />
                  )}
                </View>
                <Text style={styles.termsText}>I agree to the Terms & Conditions</Text>
              </TouchableOpacity>
            </View>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignup}
              activeOpacity={0.88}
              style={{ marginTop: 28 }}
            >
              <View style={styles.signupBtn}>
                <Text style={styles.signupBtnText}>Sign Up</Text>
              </View>
            </TouchableOpacity>

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <BackButton style={styles.backBtn} onPress={() => navigation.navigate('Splash')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backBtn: {
    position: 'absolute',
    top: 35,
    left: 20,
    zIndex: 10,
    width: 36,
    height: 36,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    marginTop: 90,
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  inputError: {
    borderColor: '#E43414',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
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
  errorText: {
    fontSize: 12,
    color: '#E43414',
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 4,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  termsCheckArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  termsText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  signupBtn: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E43414',
  },
  signupBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  loginLink: {
    fontSize: 15,
    color: '#E43414',
    fontWeight: '500',
  },
});

export default SignupScreen;
