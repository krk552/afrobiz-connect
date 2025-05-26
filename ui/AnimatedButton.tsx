import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
  interpolateColor
} from 'react-native-reanimated';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface AnimatedButtonProps {
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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedButton({
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
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      backgroundColor: interpolateColor(
        pressed.value,
        [0, 1],
        [
          variant === 'default' ? '#FF6B35' : 
          variant === 'destructive' ? '#EF4444' : 
          'transparent',
          variant === 'default' ? '#E55A2B' : 
          variant === 'destructive' ? '#DC2626' : 
          '#F3F4F6'
        ]
      ),
    };
  });

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 400,
    });
    pressed.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
    pressed.value = withTiming(0, { duration: 100 });
  };

  const handlePress = () => {
    if (disabled || loading || !onPress) return;
    
    // Haptic feedback effect
    scale.value = withSpring(0.98, {
      damping: 10,
      stiffness: 300,
    }, () => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 400,
      });
    });
    
    runOnJS(onPress)();
  };

  // Disabled animation
  React.useEffect(() => {
    opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 200 });
  }, [disabled]);

  const getTextColor = () => {
    switch (variant) {
      case 'default':
      case 'destructive':
        return '#FFFFFF';
      case 'outline':
      case 'secondary':
        return '#374151';
      case 'ghost':
      case 'link':
        return '#FF6B35';
      default:
        return '#FFFFFF';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator 
            size="small" 
            color={getTextColor()} 
            style={{ marginRight: children ? 8 : 0 }}
          />
          {children && (
            <Text style={[styles.text, styles[`textSize_${size}`], { color: getTextColor() }, textStyle]}>
              {children}
            </Text>
          )}
        </>
      );
    }

    if (icon && !children) {
      return (
        <Ionicons 
          name={icon} 
          size={size === 'lg' ? 24 : size === 'sm' ? 16 : 20} 
          color={getTextColor()} 
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
              color={getTextColor()} 
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[styles.text, styles[`textSize_${size}`], { color: getTextColor() }, textStyle]}>
            {children}
          </Text>
          {iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16} 
              color={getTextColor()} 
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      );
    }

    return (
      <Text style={[styles.text, styles[`textSize_${size}`], { color: getTextColor() }, textStyle]}>
        {children}
      </Text>
    );
  };

  return (
    <AnimatedTouchable 
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        animatedStyle,
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {renderContent()}
    </AnimatedTouchable>
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
    borderColor: '#FF6B35',
  },
  variant_destructive: {
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
    fontSize: 0,
  },
}); 