import React, { useState } from 'react';
import {
  Image,
  View,
  StyleSheet,
  ImageStyle,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';

interface CachedImageProps {
  uri?: string;
  style?: ImageStyle | ImageStyle[];
  containerStyle?: ViewStyle;
  priority?: 'normal' | 'high' | 'low';
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
}

export default function CachedImage({
  uri,
  style,
  containerStyle,
  priority,
  contentFit = 'cover',
  onLoad,
}: CachedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const hasUri = !!uri && uri.length > 0;

  if (!hasUri) return null;

  const resizeModeMap: Record<string, 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'> = {
    cover: 'cover',
    contain: 'contain',
    fill: 'stretch',
    none: 'center',
    'scale-down': 'contain',
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setDimensions({ width, height });
    }
  };

  const resolvedStyle = Array.isArray(style) ? style : [style];

  return (
    <View
      style={[styles.wrapper, containerStyle, !isLoaded && styles.shimmer]}
      onLayout={handleLayout}
    >
      <Image
        source={{ uri, cache: 'force-cache' }}
        style={[
          ...resolvedStyle,
          { resizeMode: resizeModeMap[contentFit] || 'cover' },
          !isLoaded && { opacity: 0 },
        ]}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  shimmer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
