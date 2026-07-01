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
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isDetecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isDetecting]);

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
        
        // Show checkmark animation
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }).start();
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
    
    Animated.spring(checkmarkScale, {
      toValue: 1,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
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
      <StatusBar barStyle="light-content" backgroundColor="#0A0C12" />
      <SafeAreaView style={styles.safeArea}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#99E1D9', '#E43414']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: '50%' }]}
            />
          </View>
          <Text style={styles.progressText}>Step 1 of 2</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeIn }]}>
            <Text style={styles.title}>Where are you?</Text>
            <Text style={styles.subtitle}>
              We'll show you events near you
            </Text>
          </Animated.View>

          {/* Location Icon */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.pulseCircle,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={styles.iconBackground}>
              {selectedLocation ? (
                <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
                  <Ionicons name="checkmark-circle" size={64} color="#2ED573" />
                </Animated.View>
              ) : (
                <Ionicons name="location" size={48} color="#99E1D9" />
              )}
            </View>
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
                  }}
                  style={styles.changeBtn}
                >
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Manual Input */}
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
                  if (selectedLocation) {
                    setSelectedLocation(null);
                    checkmarkScale.setValue(0);
                  }
                }}
                autoCapitalize="words"
              />
              {manualInput.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setManualInput('');
                  setSuggestions([]);
                  setSelectedLocation(null);
                  checkmarkScale.setValue(0);
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

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color="#E43414" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Skip for Now */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => {
              // Use default location
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
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedLocation}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={selectedLocation ? ['#99E1D9', '#E43414'] : ['#333', '#333']}
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
    backgroundColor: '#0A0C12',
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
  header: {
    marginTop: 32,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(153,225,217,0.2)',
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#161B24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(153,225,217,0.3)',
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161B24',
    borderRadius: 14,
    height: 56,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(153,225,217,0.3)',
    marginBottom: 24,
  },
  detectBtnDisabled: {
    opacity: 0.7,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detectBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedContainer: {
    marginBottom: 24,
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B24',
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
    fontWeight: '600',
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
    color: '#99E1D9',
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
    backgroundColor: '#161B24',
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
  },
  clearBtn: {
    padding: 4,
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#161B24',
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default LocationStep;
