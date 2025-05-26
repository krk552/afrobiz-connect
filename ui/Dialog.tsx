import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  style?: ViewStyle;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface DialogContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface DialogFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Dialog({ 
  visible, 
  onClose, 
  children, 
  title, 
  description, 
  showCloseButton = true,
  style 
}: DialogProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={styles.blurOverlay}>
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1}
            onPress={onClose}
          />
          
          <View style={[styles.dialog, style]}>
            {(title || description || showCloseButton) && (
              <View style={styles.header}>
                <View style={styles.headerText}>
                  {title && <Text style={styles.title}>{title}</Text>}
                  {description && <Text style={styles.description}>{description}</Text>}
                </View>
                {showCloseButton && (
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            <View style={styles.content}>
              {children}
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

export function DialogHeader({ children, style }: DialogHeaderProps) {
  return (
    <View style={[styles.customHeader, style]}>
      {children}
    </View>
  );
}

export function DialogContent({ children, style }: DialogContentProps) {
  return (
    <View style={[styles.customContent, style]}>
      {children}
    </View>
  );
}

export function DialogFooter({ children, style }: DialogFooterProps) {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxWidth: screenWidth - 32,
    maxHeight: screenHeight - 100,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  customHeader: {
    padding: 24,
    paddingBottom: 16,
  },
  customContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
}); 