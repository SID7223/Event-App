import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onVoiceSearch?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  style?: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onChangeText,
  placeholder = 'Search events...',
  onVoiceSearch,
  onFocus,
  onBlur,
  autoFocus = false,
  style,
}) => {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useRef(false);

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused.current ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isFocused.current]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.08)', 'rgba(61,226,209,0.5)'],
  });

  const glowOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleFocus = () => {
    isFocused.current = true;
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    isFocused.current = false;
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
    onBlur?.();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor,
          shadowColor: '#3DE2D1',
          shadowOpacity: glowOpacity,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 0 },
          elevation: glowOpacity,
        },
      ]}
    >
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        <View style={styles.row}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
            returnKeyType="search"
            autoFocus={autoFocus}
          />
          {onVoiceSearch && (
            <TouchableOpacity onPress={onVoiceSearch} style={styles.voiceButton}>
              <Ionicons name="mic-outline" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  blur: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  voiceButton: {
    marginLeft: 10,
    padding: 4,
  },
});

export default SearchBar;
