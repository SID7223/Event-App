import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fonts } from '../../theme/fonts';

const { width } = Dimensions.get('window');

type AuthMode = 'login' | 'signup';

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const toggleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(mode === 'login' ? 0 : 1)).current;
  const formOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: mode === 'login' ? 0 : 1,
      tension: 65,
      friction: 11,
      useNativeDriver: false,
    }).start();
  }, [mode]);

  const switchMode = (newMode: AuthMode) => {
    if (newMode === mode) return;
    
    Animated.timing(formOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setMode(newMode);
      setErrors({});
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'At least 6 characters required';
    }

    if (mode === 'signup') {
      if (!firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    
    // Navigate to location step
    navigation.navigate('LocationStep', {
      user: {
        id: Date.now().toString(),
        firstName: firstName || 'User',
        lastName: lastName || '',
        email,
        phone,
        avatar: '',
        interests: [],
        notifications: true,
      },
    });
  };

  const getPasswordStrength = (pwd: string): { level: number; label: string; color: string } => {
    if (pwd.length === 0) return { level: 0, label: '', color: 'transparent' };
    if (pwd.length < 6) return { level: 1, label: 'Weak', color: '#E43414' };
    if (pwd.length < 8) return { level: 2, label: 'Fair', color: '#FFA500' };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) {
      return { level: 4, label: 'Strong', color: '#2ED573' };
    }
    return { level: 3, label: 'Good', color: '#FF6B4A' };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0C12" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {mode === 'login' ? 'Welcome Back 👋' : 'Create Account'}
              </Text>
              <Text style={styles.subtitle}>
                {mode === 'login' ? 'Login to continue' : 'Join Zyntr today'}
              </Text>
            </View>

            {/* Mode Toggle */}
            <View style={styles.toggleContainer}>
              <View style={styles.toggleBackground}>
                <Animated.View
                  style={[
                    styles.toggleIndicator,
                    {
                      left: toggleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width - 48 - 4],
                      }),
                    },
                  ]}
                />
                <TouchableOpacity
                  style={styles.toggleOption}
                  onPress={() => switchMode('login')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toggleOption}
                  onPress={() => switchMode('signup')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialSection}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
                <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, styles.appleBtn]} activeOpacity={0.85}>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={styles.socialBtnText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form */}
            <Animated.View style={[styles.form, { opacity: formOpacity }]}>
              {/* Name Fields (Signup only) */}
              {mode === 'signup' && (
                <View style={styles.nameRow}>
                  <View style={[styles.inputWrapper, styles.nameInput, errors.firstName ? styles.inputError : null]}>
                    <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="First Name"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={[styles.inputWrapper, styles.nameInput, errors.lastName ? styles.inputError : null]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Last Name"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}
              {mode === 'signup' && errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
              {mode === 'signup' && errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}

              {/* Phone (Signup only) */}
              {mode === 'signup' && (
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              {/* Email */}
              <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              {/* Password */}
              <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
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
              
              {/* Password Strength Indicator */}
              {mode === 'signup' && password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor: level <= passwordStrength.level
                              ? passwordStrength.color
                              : 'rgba(255,255,255,0.1)',
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              )}

              {/* Confirm Password (Signup only) */}
              {mode === 'signup' && (
                <>
                  <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputError : null]}>
                    <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Confirm Password"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="rgba(255,255,255,0.4)"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </>
              )}

              {/* Forgot Password (Login only) */}
              {mode === 'login' && (
                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={handleAuth}
              activeOpacity={0.88}
              disabled={isLoading}
            >
              <View style={[styles.retroBtnOuter, isLoading && styles.actionBtnDisabled]}>
                <View style={styles.retroBtnInner}>
                  {isLoading ? (
                    <ActivityIndicator color="#0A0C12" size="small" />
                  ) : (
                    <>
                      <Text style={styles.retroBtnText}>
                        {mode === 'login' ? 'Login' : 'Create Account'}
                      </Text>
                      <View style={styles.retroBtnArrow}>
                        <Ionicons name="arrow-forward" size={12} color="#0A0C12" />
                      </View>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Terms (Signup only) */}
            {mode === 'signup' && (
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            )}
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
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
    marginTop: 20,
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: fonts.heading,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
  },
  toggleContainer: {
    marginBottom: 28,
  },
  toggleBackground: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 4,
    position: 'relative',
  },
  toggleIndicator: {
    position: 'absolute',
    top: 4,
    width: (width - 48 - 4) / 2,
    height: '100%',
    backgroundColor: '#FF6B4A',
    borderRadius: 12,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
  },
  toggleTextActive: {
    color: '#0A0C12',
  },
  socialSection: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    height: 54,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  appleBtn: {
    backgroundColor: '#8B2010',
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    marginHorizontal: 14,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
  },
  form: {
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  inputError: {
    borderColor: '#E43414',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    height: '100%',
    outlineWidth: 0,
    outlineColor: 'transparent',
    outlineStyle: 'none' as any,
    fontFamily: fonts.body,
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#E43414',
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 4,
    fontFamily: fonts.body,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: -8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 4,
  },
  forgotText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  actionBtn: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionBtnDisabled: {
    opacity: 0.7,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: fonts.bodyBold,
  },
  retroBtnOuter: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#FFF44F',
    borderRadius: 8,
    padding: 2,
    marginBottom: 16,
    justifyContent: 'center',
  },
  retroBtnInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF44F',
    borderRadius: 6,
  },
  retroBtnText: {
    color: '#0A0C12',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: fonts.bodyBold,
  },
  retroBtnArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#FF6B4A',
    fontWeight: '500',
  },
});

export default AuthScreen;
