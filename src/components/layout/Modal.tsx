import React from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/spacing';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  style,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.container, style]}>
          <View style={styles.handleBarContainer}>
            <View style={styles.handleBar} />
          </View>

          <View style={styles.header}>
            {title && <Text style={styles.title}>{title}</Text>}
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  container: {
    backgroundColor: 'rgba(26,32,42,0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.xl,
    padding: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.full,
  },
  content: {
    maxHeight: '80%',
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
});

export default Modal;