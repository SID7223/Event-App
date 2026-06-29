import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AvatarProps {
  uri?: string;
  size?: number;
  style?: ViewStyle;
  onPress?: (event: GestureResponderEvent) => void;
  initials?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 48,
  style,
  onPress,
  initials = '?',
}) => {
  const borderWidth = 2;
  const fontSize = size * 0.38;

  const avatarContent = (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: size - borderWidth * 2,
              height: size - borderWidth * 2,
              borderRadius: (size - borderWidth * 2) / 2,
            },
          ]}
        />
      ) : (
        <LinearGradient
          colors={['#3DE2D1', '#FF5A3C']}
          style={[
            styles.gradient,
            {
              width: size - borderWidth * 2,
              height: size - borderWidth * 2,
              borderRadius: (size - borderWidth * 2) / 2,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </LinearGradient>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return avatarContent;
};

const styles = StyleSheet.create({
  container: {
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  image: {
    overflow: 'hidden',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default Avatar;
