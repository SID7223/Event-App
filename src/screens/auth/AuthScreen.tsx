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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { login as apiLogin } from '../../services/api';
import { useAuth } from '../../store';
import { fonts } from '../../theme/fonts';
import BackButton from '../../components/BackButton';

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { signIn, isLoading: googleLoading, error: googleError } = useGoogleAuth();
  const { loginWithTokens } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const authData = await apiLogin(email, password);
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
      setErrors({ email: err.message || 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <BackButton style={styles.backBtn} onPress={() => navigation.navigate('Splash')} />
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
              <Text style={styles.title}>Login</Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.submitArrow}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialSection}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
                <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialBtn}
                activeOpacity={0.85}
                onPress={() => signIn().catch(() => {})}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.googleGText}>G</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
                <Text style={styles.xIcon}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account yet? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    justifyContent: 'flex-start',
    paddingTop: 110,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: fonts.heading,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: fonts.body,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: fonts.body,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  submitArrow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E43414',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#E43414',
    marginTop: 6,
    marginLeft: 4,
    fontFamily: fonts.body,
  },
  forgotBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 32,
  },
  forgotText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: fonts.body,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: fonts.body,
  },
  socialSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  socialBtn: {
    width: 64,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  googleGText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  xIcon: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: fonts.body,
  },
  signupLink: {
    fontSize: 14,
    color: '#E43414',
    fontWeight: '500',
    fontFamily: fonts.body,
  },
});

export default AuthScreen;
