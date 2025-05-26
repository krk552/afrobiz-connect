import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AvatarSize = 'sm' | 'default' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  verified?: boolean;
  online?: boolean;
}

export default function Avatar({
  src,
  alt,
  fallback,
  size = 'default',
  style,
  textStyle,
  verified = false,
  online = false,
}: AvatarProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { width: 32, height: 32, borderRadius: 16 };
      case 'default': return { width: 40, height: 40, borderRadius: 20 };
      case 'lg': return { width: 56, height: 56, borderRadius: 28 };
      case 'xl': return { width: 80, height: 80, borderRadius: 40 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 12;
      case 'default': return 16;
      case 'lg': return 20;
      case 'xl': return 28;
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'sm': return 8;
      case 'default': return 12;
      case 'lg': return 16;
      case 'xl': return 20;
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.avatar, sizeStyles]}>
        {src ? (
          <Image 
            source={{ uri: src }} 
            style={[styles.image, sizeStyles]}
            alt={alt}
          />
        ) : (
          <View style={[styles.fallback, sizeStyles]}>
            <Text style={[
              styles.fallbackText, 
              { fontSize: getFontSize() },
              textStyle
            ]}>
              {fallback || '?'}
            </Text>
          </View>
        )}
        
        {verified && (
          <View style={[styles.verifiedBadge, { 
            width: getBadgeSize(), 
            height: getBadgeSize(),
            borderRadius: getBadgeSize() / 2,
            bottom: -2,
            right: -2,
          }]}>
            <Ionicons 
              name="checkmark" 
              size={getBadgeSize() * 0.6} 
              color="white" 
            />
          </View>
        )}
        
        {online && (
          <View style={[styles.onlineBadge, { 
            width: getBadgeSize(), 
            height: getBadgeSize(),
            borderRadius: getBadgeSize() / 2,
            bottom: -2,
            right: verified ? getBadgeSize() + 2 : -2,
          }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: 'white',
    fontWeight: '600',
  },
  verifiedBadge: {
    position: 'absolute',
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  onlineBadge: {
    position: 'absolute',
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
}); 