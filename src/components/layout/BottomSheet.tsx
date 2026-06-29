import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/spacing';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  title?: string;
  style?: ViewStyle;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = [300, 500],
  title,
  style,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const lastGestureY = useRef(0);
  const isClosing = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        lastGestureY.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          const progress = gestureState.dy / snapPoints[0];
          overlayOpacity.setValue(1 - Math.min(progress, 1));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          hideSheet();
        } else {
          showSheet();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      showSheet();
    } else {
      hideSheet();
    }
  }, [visible]);

  const showSheet = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 25,
        bounciness: 8,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideSheet = () => {
    if (isClosing.current) return;
    isClosing.current = true;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      isClosing.current = false;
      onClose();
    });
  };

  const overlayAnimatedStyle = {
    opacity: overlayOpacity,
  };

  const sheetAnimatedStyle = {
    transform: [{ translateY }],
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.overlay, overlayAnimatedStyle]}
      >
        <Animated.View
          style={[styles.overlayTouchable]}
          {...panResponder.panHandlers}
        />
      </Animated.View>

      <Animated.View
        style={[styles.sheet, sheetAnimatedStyle, style]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handleBarContainer}>
          <View style={styles.handleBar} />
        </View>

        {title && (
          <Text style={styles.title}>{title}</Text>
        )}

        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  overlayTouchable: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26,32,42,0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderBottomWidth: 0,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
});

export default BottomSheet;