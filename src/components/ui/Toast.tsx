import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  type: ToastType;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: {
    label: string;
    onPress: () => void;
  };
}

let showToastFn: ((data: ToastData) => void) | null = null;

export const showToast = (data: ToastData) => {
  showToastFn?.(data);
};

const iconMap: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  info: 'information-circle',
};

const colorMap: Record<ToastType, string> = {
  success: '#2ED573',
  error: '#FF6A3D',
  info: '#3DE2D1',
};

const Toast: React.FC = () => {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const [visible, setVisible] = useState(false);
  const [toastData, setToastData] = useState<ToastData>({
    type: 'info',
    message: '',
  });
  const dismissTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    showToastFn = (data: ToastData) => {
      if (dismissTimeout.current) {
        clearTimeout(dismissTimeout.current);
      }
      setToastData(data);
      setVisible(true);

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 12,
      }).start();

      dismissTimeout.current = setTimeout(() => {
        hideToast();
      }, 3000);
    };

    return () => {
      if (dismissTimeout.current) {
        clearTimeout(dismissTimeout.current);
      }
    };
  }, []);

  const hideToast = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  if (!visible) return null;

  const iconName = toastData.icon || iconMap[toastData.type];
  const accentColor = colorMap[toastData.type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="box-none"
    >
      <BlurView intensity={30} tint="dark" style={styles.blur}>
        <View style={styles.row}>
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}22` }]}>
            <Ionicons name={iconName} size={20} color={accentColor} />
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {toastData.message}
          </Text>
          {toastData.action && (
            <TouchableOpacity onPress={toastData.action.onPress} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: accentColor }]}>
                {toastData.action.label}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
            <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: (StatusBar.currentHeight || 44) + 8,
    paddingHorizontal: 16,
  },
  blur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default Toast;
