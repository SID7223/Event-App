import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useAuth } from '../../store';
import { UserLocation } from '../../types';
import { fonts } from '../../theme/fonts';

const { width } = Dimensions.get('window');

// Mock location suggestions
const LOCATION_SUGGESTIONS = [
  { id: '1', city: 'Lahore', neighborhood: 'Gulberg', full: 'Gulberg, Lahore, Pakistan' },
  { id: '2', city: 'Lahore', neighborhood: 'DHA', full: 'DHA, Lahore, Pakistan' },
  { id: '3', city: 'Lahore', neighborhood: 'Johar Town', full: 'Johar Town, Lahore, Pakistan' },
  { id: '4', city: 'Karachi', neighborhood: 'DHA', full: 'DHA, Karachi, Pakistan' },
  { id: '5', city: 'Karachi', neighborhood: 'Clifton', full: 'Clifton, Karachi, Pakistan' },
  { id: '6', city: 'Islamabad', neighborhood: 'F-8', full: 'F-8, Islamabad, Pakistan' },
  { id: '7', city: 'Islamabad', neighborhood: 'F-10', full: 'F-10, Islamabad, Pakistan' },
  { id: '8', city: 'Rawalpindi', neighborhood: 'Saddar', full: 'Saddar, Rawalpindi, Pakistan' },
];

const LocationStep: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setLocation } = useAuth();
  
  const user = route.params?.user;
  
  const [manualInput, setManualInput] = useState('');
  const [suggestions, setSuggestions] = useState<typeof LOCATION_SUGGESTIONS>([]);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState('');
  
  const fadeIn = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkRotate = useRef(new Animated.Value(0)).current;
  const bgGreen = useRef(new Animated.Value(0)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 12 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      runConfirmAnimation();
    }
  }, [selectedLocation]);

  const runConfirmAnimation = () => {
    // Reset values
    checkmarkScale.setValue(0);
    checkmarkRotate.setValue(0);
    bgGreen.setValue(0);
    ripple1.setValue(0);
    ripple2.setValue(0);
    ripple3.setValue(0);
    glowPulse.setValue(0);
    particleAnims.forEach(p => {
      p.opacity.setValue(0);
      p.scale.setValue(0);
      p.x.setValue(0);
      p.y.setValue(0);
    });

    // Phase 1: Ripple rings expand outward (0-600ms)
    const ripples = [ripple1, ripple2, ripple3].map((ripple, i) =>
      Animated.sequence([
        Animated.delay(i * 150),
        Animated.parallel([
          Animated.timing(ripple, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Phase 2: Center fills green with glow pulse
    const centerFill = Animated.parallel([
      Animated.timing(bgGreen, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Glow pulse animation
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.6,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Phase 3: Particle burst
    const particles = particleAnims.map((particle, i) => {
      const angle = (2 * Math.PI / particleAnims.length) * i;
      const distance = 70 + Math.random() * 30;
      return Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: Math.cos(angle) * distance,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: Math.sin(angle) * distance,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.delay(300),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.spring(particle.scale, {
              toValue: 1,
              tension: 100,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]);
    });

    // Phase 4: Checkmark pops in with rotation
    const checkmark = Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(checkmarkRotate, {
          toValue: 1,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Run all phases
    Animated.parallel([
      Animated.parallel(ripples),
      centerFill,
      Animated.parallel(particles),
      checkmark,
    ]).start();
  };

  useEffect(() => {
    if (manualInput.length > 0) {
      const filtered = LOCATION_SUGGESTIONS.filter(
        (loc) =>
          loc.city.toLowerCase().includes(manualInput.toLowerCase()) ||
          loc.neighborhood.toLowerCase().includes(manualInput.toLowerCase()) ||
          loc.full.toLowerCase().includes(manualInput.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [manualInput]);

  const detectLocation = async () => {
    setIsDetecting(true);
    setError('');
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setPermissionDenied(true);
        setIsDetecting(false);
        setError('Location permission denied. Please enter manually.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const detectedLocation: UserLocation = {
          city: address.city || 'Unknown City',
          neighborhood: address.subregion || address.district || '',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          country: address.country || '',
          fullAddress: `${address.subregion || address.district || ''}, ${address.city || ''}, ${address.country || ''}`.replace(/^,\s*/, ''),
        };
        
        setSelectedLocation(detectedLocation);
        setIsDetecting(false);
      }
    } catch (err) {
      setError('Could not detect location. Please enter manually.');
      setIsDetecting(false);
    }
  };

  const selectSuggestion = (suggestion: typeof LOCATION_SUGGESTIONS[0]) => {
    const location: UserLocation = {
      city: suggestion.city,
      neighborhood: suggestion.neighborhood,
      latitude: 0,
      longitude: 0,
      country: 'Pakistan',
      fullAddress: suggestion.full,
    };
    
    setSelectedLocation(location);
    setManualInput(suggestion.full);
    setSuggestions([]);
  };

  const handleContinue = () => {
    if (selectedLocation) {
      setLocation(selectedLocation);
      navigation.navigate('VibeQuiz', {
        user,
        location: selectedLocation,
      });
    }
  };

  const renderSuggestion = ({ item }: { item: typeof LOCATION_SUGGESTIONS[0] }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => selectSuggestion(item)}
      activeOpacity={0.7}
    >
      <Ionicons name="location-outline" size={20} color="rgba(255,255,255,0.5)" />
      <View style={styles.suggestionText}>
        <Text style={styles.suggestionCity}>{item.city}</Text>
        <Text style={styles.suggestionNeighborhood}>{item.neighborhood}</Text>
      </View>
      <Text style={styles.suggestionFull}>{item.full}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: '50%', backgroundColor: '#FF6B4A' }]}
            />
          </View>
          <Text style={styles.progressText}>Step 1 of 2</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, selectedLocation && styles.scrollContentCentered]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, selectedLocation && styles.headerCentered, { opacity: fadeIn }]}>
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit={true}>
              {selectedLocation ? `${selectedLocation.city} is buzzing` : 'Where are you?'}
            </Text>
            <Text style={styles.subtitle}>
              {selectedLocation ? 'What are you into?' : "We'll show you events near you"}
            </Text>
          </Animated.View>

          {/* Location Icon */}
          <View style={[styles.iconContainer, selectedLocation && styles.iconContainerCentered]}>
            {/* Ripple rings */}
            {selectedLocation && [ripple1, ripple2, ripple3].map((ripple, i) => (
              <Animated.View
                key={`ripple-${i}`}
                style={[
                  styles.rippleRing,
                  {
                    opacity: ripple.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0, 0.5, 0],
                    }),
                    transform: [{
                      scale: ripple.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 2.5],
                      }),
                    }],
                  },
                ]}
              />
            ))}

            {/* Particle burst */}
            {selectedLocation && particleAnims.map((particle, i) => {
              const colors = ['#2ED573', '#FFD700', '#FF6B4A', '#99E1D9', '#FFFFFF'];
              return (
                <Animated.View
                  key={`particle-${i}`}
                  style={[
                    styles.particle,
                    {
                      backgroundColor: colors[i % colors.length],
                      opacity: particle.opacity,
                      transform: [
                        { translateX: particle.x },
                        { translateY: particle.y },
                        { scale: particle.scale },
                      ],
                    },
                  ]}
                />
              );
            })}

            {/* Glow effect */}
            {selectedLocation && (
              <Animated.View
                style={[
                  styles.glowEffect,
                  {
                    opacity: glowPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.4],
                    }),
                    transform: [{
                      scale: glowPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.3],
                      }),
                    }],
                  },
                ]}
              />
            )}

            {/* Main circle — fills green */}
            <Animated.View
              style={[
                styles.iconBackground,
                {
                  backgroundColor: bgGreen.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(255,255,255,0.06)', '#2ED573'],
                  }),
                  shadowColor: selectedLocation ? '#2ED573' : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: selectedLocation ? 0.5 : 0,
                  shadowRadius: selectedLocation ? 20 : 0,
                },
              ]}
            >
              {selectedLocation ? (
                <Animated.View style={{
                  transform: [
                    { scale: checkmarkScale },
                    {
                      rotate: checkmarkRotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['-90deg', '0deg'],
                      }),
                    },
                  ],
                }}>
                  <Ionicons name="checkmark" size={48} color="#FFFFFF" />
                </Animated.View>
              ) : (
                <Ionicons name="location" size={48} color="#FF6B4A" style={{ marginTop: 4 }} />
              )}
            </Animated.View>
          </View>

          {/* Auto Detect Button */}
          {!selectedLocation && (
            <TouchableOpacity
              style={[styles.detectBtn, isDetecting && styles.detectBtnDisabled]}
              onPress={detectLocation}
              disabled={isDetecting}
              activeOpacity={0.8}
            >
              {isDetecting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="navigate" size={20} color="#FFFFFF" />
                  <Text style={styles.detectBtnText}>Auto-detect Location</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Selected Location Display */}
          {selectedLocation && (
            <View style={styles.selectedContainer}>
              <View style={styles.selectedCard}>
                <Ionicons name="checkmark-circle" size={24} color="#2ED573" />
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedCity}>{selectedLocation.city}</Text>
                  <Text style={styles.selectedAddress}>{selectedLocation.fullAddress}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedLocation(null);
                    setManualInput('');
                    checkmarkScale.setValue(0);
                    checkmarkRotate.setValue(0);
                    bgGreen.setValue(0);
                    glowPulse.setValue(0);
                  }}
                  style={styles.changeBtn}
                >
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Divider */}
          {!selectedLocation && (
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
          )}

          {/* Manual Input */}
          {!selectedLocation && (
            <View style={styles.manualSection}>
              <View style={styles.inputWrapper}>
                <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Search city or neighborhood..."
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={manualInput}
                  onChangeText={(text) => {
                    setManualInput(text);
                    setIsManualMode(true);
                  }}
                  autoCapitalize="words"
                />
                {manualInput.length > 0 && (
                  <TouchableOpacity onPress={() => {
                    setManualInput('');
                    setSuggestions([]);
                  }} style={styles.clearBtn}>
                    <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={suggestions}
                    renderItem={renderSuggestion}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    style={styles.suggestionsList}
                  />
                </View>
              )}
            </View>
          )}

          {/* Error Message */}
          {error && !selectedLocation ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color="#E43414" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Skip for Now */}
          {!selectedLocation && (
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => {
                const defaultLocation: UserLocation = {
                  city: 'Lahore',
                  neighborhood: 'Gulberg',
                  latitude: 31.5204,
                  longitude: 74.3587,
                  country: 'Pakistan',
                  fullAddress: 'Gulberg, Lahore, Pakistan',
                };
                setLocation(defaultLocation);
                navigation.navigate('VibeQuiz', {
                  user,
                  location: defaultLocation,
                });
              }}
            >
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedLocation}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={selectedLocation ? ['#FF6B4A', '#E43414'] : ['#333', '#333']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.continueBtn, !selectedLocation && styles.continueBtnDisabled]}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
  },
  header: {
    marginTop: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  headerCentered: {
    marginTop: 0,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: fonts.heading,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: fonts.body,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    width: 160,
    height: 160,
  },
  iconContainerCentered: {
    marginBottom: 40,
    width: 160,
    height: 160,
  },
  rippleRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#2ED573',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  glowEffect: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2ED573',
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    height: 50,
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  detectBtnDisabled: {
    opacity: 0.7,
  },
  detectBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  selectedContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(46,213,115,0.3)',
  },
  selectedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedCity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  selectedAddress: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  changeBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B4A',
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
    fontSize: 14,
  },
  manualSection: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
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
  clearBtn: {
    padding: 4,
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  suggestionText: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionCity: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  suggestionNeighborhood: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  suggestionFull: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(228,52,20,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#E43414',
    flex: 1,
  },
  skipBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipBtnText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: 'rgba(10,12,18,0.95)',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 18,
    gap: 8,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

export default LocationStep;
