import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChipProps {
  children?: React.ReactNode;
  variant?: 'default' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Chip({
  children,
  variant = 'default',
  size = 'default',
  style,
  textStyle,
}: ChipProps) {
  return (
    <View style={[
      styles.base,
      styles[`variant_${variant}`],
      styles[`size_${size}`],
      style,
    ]}>
      {children && (
        <Text style={[
          styles.text,
          styles[`text_${variant}`],
          styles[`textSize_${size}`],
          textStyle,
        ]}>
          {children}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },

  // Variants
  variant_default: {
    backgroundColor: '#FF6B35',
  },
  variant_secondary: {
    backgroundColor: '#F3F4F6',
  },

  // Sizes
  size_sm: {
    padding: 8,
  },
  size_default: {
    padding: 12,
  },
  size_lg: {
    padding: 16,
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

  // Text sizes
  textSize_sm: {
    fontSize: 12,
  },
  textSize_default: {
    fontSize: 14,
  },
  textSize_lg: {
    fontSize: 16,
  },
});
