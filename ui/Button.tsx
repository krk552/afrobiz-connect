import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
}

export default function Button({
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  onPress,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator 
            size="small" 
            color={variant === 'default' ? '#FFFFFF' : variant === 'destructive' ? '#FFFFFF' : '#FF6B35'} 
            style={{ marginRight: children ? 8 : 0 }}
          />
          {children && <Text style={textStyles}>{children}</Text>}
        </>
      );
    }

    if (icon && !children) {
      return (
        <Ionicons 
          name={icon} 
          size={size === 'lg' ? 24 : size === 'sm' ? 16 : 20} 
          color={variant === 'default' ? '#FFFFFF' : variant === 'destructive' ? '#FFFFFF' : '#FF6B35'} 
        />
      );
    }

    if (icon && children) {
      return (
        <>
          {iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16} 
              color={variant === 'default' ? '#FFFFFF' : variant === 'destructive' ? '#FFFFFF' : '#FF6B35'} 
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={textStyles}>{children}</Text>
          {iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16} 
              color={variant === 'default' ? '#FFFFFF' : variant === 'destructive' ? '#FFFFFF' : '#FF6B35'} 
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      );
    }

    return <Text style={textStyles}>{children}</Text>;
  };

  return (
    <TouchableOpacity 
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Variants
  variant_default: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  variant_destructive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderColor: '#E5E7EB',
  },
  variant_secondary: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6',
  },
  variant_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  variant_link: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  // Sizes
  size_default: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  },
  size_sm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
    borderRadius: 6,
  },
  size_lg: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 10,
  },
  size_icon: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_default: {
    color: '#FFFFFF',
  },
  text_destructive: {
    color: '#FFFFFF',
  },
  text_outline: {
    color: '#374151',
  },
  text_secondary: {
    color: '#374151',
  },
  text_ghost: {
    color: '#FF6B35',
  },
  text_link: {
    color: '#FF6B35',
    textDecorationLine: 'underline',
  },

  // Text sizes
  textSize_default: {
    fontSize: 14,
  },
  textSize_sm: {
    fontSize: 12,
  },
  textSize_lg: {
    fontSize: 16,
  },
  textSize_icon: {
    fontSize: 0, // Hidden for icon-only buttons
  },

  // Disabled states
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.5,
  },
}); 