import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const iconColor = getIconColor(variant, disabled);
  const iconSize = getIconSize(size);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size={size === 'small' ? 'small' : 'small'}
            color={iconColor}
          />
          <Text style={[textStyles, { marginLeft: 8 }]}>Loading...</Text>
        </View>
      );
    }

    if (icon) {
      return (
        <View style={styles.contentContainer}>
          {iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={textStyles}>{title}</Text>
          {iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </View>
      );
    }

    return <Text style={textStyles}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const getIconColor = (variant: ButtonVariant, disabled: boolean): string => {
  if (disabled) return '#9CA3AF';
  
  switch (variant) {
    case 'primary':
      return '#FFFFFF';
    case 'secondary':
      return '#FFFFFF';
    case 'outline':
      return '#F59E0B';
    case 'ghost':
      return '#F59E0B';
    case 'danger':
      return '#FFFFFF';
    default:
      return '#FFFFFF';
  }
};

const getIconSize = (size: ButtonSize): number => {
  switch (size) {
    case 'small':
      return 16;
    case 'medium':
      return 18;
    case 'large':
      return 20;
    default:
      return 18;
  }
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  
  // Variants
  primary: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  secondary: {
    backgroundColor: '#6B7280',
    borderColor: '#6B7280',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#F59E0B',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // States
  disabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#F59E0B',
  },
  ghostText: {
    color: '#F59E0B',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  
  // Size text styles
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  // Content layout
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button; 