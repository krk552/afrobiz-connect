import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoadingScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Fade in animation
    const fadeAnimation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    });

    fadeAnimation.start();
    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E', '#4ECDC4']}
      style={styles.container}
    >
      {/* Background pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(50)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                left: Math.random() * width,
                top: Math.random() * 800,
                opacity: Math.random() * 0.3,
                transform: [{ scale: Math.random() * 0.5 + 0.5 }],
              }
            ]}
          />
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo container */}
        <Animated.View style={[
          styles.logoContainer,
          { 
            transform: [
              { scale: pulseAnim },
              { rotate: spin }
            ] 
          }
        ]}>
          <Ionicons name="storefront" size={60} color="white" />
        </Animated.View>

        {/* App name */}
        <Text style={styles.appName}>AfroBiz Connect</Text>
        <Text style={styles.tagline}>Your African Marketplace</Text>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            {[...Array(3)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.loadingDot,
                  {
                    transform: [{
                      translateY: pulseAnim.interpolate({
                        inputRange: [1, 1.2],
                        outputRange: [0, -10],
                      })
                    }]
                  }
                ]}
              />
            ))}
          </View>
          <Text style={styles.loadingText}>Setting up your experience...</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 50,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
}); 