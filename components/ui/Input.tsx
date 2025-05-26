import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type InputVariant = 'default' | 'filled' | 'outline';
export type InputSize = 'small' | 'medium' | 'large';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: InputVariant;
  size?: InputSize;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'outline',
  size = 'medium',
  error,
  helperText,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  labelStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const containerStyle = [
    styles.container,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    styles[variant],
    styles[size],
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
  ];

  const textInputStyle = [
    styles.input,
    styles[`${size}Input`],
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    multiline && styles.multilineInput,
    inputStyle,
  ];

  const labelStyles = [
    styles.label,
    styles[`${size}Label`],
    error && styles.errorLabel,
    disabled && styles.disabledLabel,
    labelStyle,
  ];

  const handleRightIconPress = () => {
    if (secureTextEntry) {
      setIsPasswordVisible(!isPasswordVisible);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const getRightIcon = () => {
    if (secureTextEntry) {
      return isPasswordVisible ? 'eye-off' : 'eye';
    }
    return rightIcon;
  };

  const getIconColor = () => {
    if (disabled) return '#9CA3AF';
    if (error) return '#EF4444';
    if (isFocused) return '#F59E0B';
    return '#6B7280';
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'medium':
        return 20;
      case 'large':
        return 22;
      default:
        return 20;
    }
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={labelStyles}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={getIconSize()}
            color={getIconColor()}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={textInputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            style={styles.rightIconContainer}
            disabled={!secureTextEntry && !onRightIconPress}
          >
            <Ionicons
              name={getRightIcon()}
              size={getIconSize()}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[
          styles.helperText,
          error ? styles.errorText : styles.normalHelperText
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#374151',
  },
  
  required: {
    color: '#EF4444',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  
  // Variants
  default: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  filled: {
    borderColor: 'transparent',
    backgroundColor: '#F3F4F6',
  },
  outline: {
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  
  // States
  focused: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  error: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  disabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  
  // Input styles
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
  },
  
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  
  inputWithRightIcon: {
    marginRight: 8,
  },
  
  multilineInput: {
    textAlignVertical: 'top',
  },
  
  // Size-specific input styles
  smallInput: {
    fontSize: 14,
  },
  mediumInput: {
    fontSize: 16,
  },
  largeInput: {
    fontSize: 18,
  },
  
  // Size-specific label styles
  smallLabel: {
    fontSize: 12,
  },
  mediumLabel: {
    fontSize: 14,
  },
  largeLabel: {
    fontSize: 16,
  },
  
  // Icon styles
  leftIcon: {
    marginLeft: 4,
  },
  
  rightIconContainer: {
    padding: 4,
  },
  
  // Helper text styles
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  
  normalHelperText: {
    color: '#6B7280',
  },
  
  errorText: {
    color: '#EF4444',
  },
  
  errorLabel: {
    color: '#EF4444',
  },
  
  disabledLabel: {
    color: '#9CA3AF',
  },
});

export default Input; 