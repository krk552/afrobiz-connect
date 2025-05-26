import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';
type BadgeSize = 'sm' | 'default' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'default',
  icon,
  style,
  textStyle,
}: BadgeProps) {
  return (
    <View style={[
      styles.base,
      styles[`variant_${variant}`],
      styles[`size_${size}`],
      style,
    ]}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12} 
          color={styles[`text_${variant}`].color}
          style={{ marginRight: 4 }}
        />
      )}
      <Text style={[
        styles.text,
        styles[`text_${variant}`],
        styles[`textSize_${size}`],
        textStyle,
      ]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },

  // Variants
  variant_default: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  variant_secondary: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6',
  },
  variant_destructive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  variant_success: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  variant_warning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderColor: '#E5E7EB',
  },

  // Sizes
  size_sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  size_default: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  size_lg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  // Text styles
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  text_default: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#374151',
  },
  text_destructive: {
    color: '#EF4444',
  },
  text_success: {
    color: '#059669',
  },
  text_warning: {
    color: '#D97706',
  },
  text_outline: {
    color: '#374151',
  },

  // Text sizes
  textSize_sm: {
    fontSize: 10,
  },
  textSize_default: {
    fontSize: 12,
  },
  textSize_lg: {
    fontSize: 14,
  },
}); 