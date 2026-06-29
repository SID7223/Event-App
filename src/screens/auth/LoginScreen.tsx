import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store';
import { mockUser } from '../../services/mockData';

const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email or phone is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'At least 6 characters required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validate()) {
      login(mockUser);
    }
  };

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
            {/* Back button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back 👋</Text>
              <Text style={styles.subtitle}>Login to continue</Text>
            </View>

            {/* Inputs */}
            <View style={styles.inputsSection}>
              {/* Email or Phone */}
              <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="Email or Phone"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
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

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.88}>
              <LinearGradient
                colors={['#99E1D9', '#E43414']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtn}
              >
                <Text style={styles.loginBtnText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons — side by side */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={styles.socialBtnText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
  backBtn: {
    marginTop: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  header: {
    marginTop: 28,
    marginBottom: 36,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  inputsSection: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B24',
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
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 4,
  },
  forgotText: {
    fontSize: 14,
    color: '#99E1D9',
    fontWeight: '500',
  },
  loginBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  socialRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 36,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161B24',
    borderRadius: 14,
    height: 54,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  googleG: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  signupLink: {
    fontSize: 15,
    color: '#99E1D9',
    fontWeight: '600',
  },
});

export default LoginScreen;
