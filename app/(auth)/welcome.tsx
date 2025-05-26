import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: string[];
}

const onboardingData: OnboardingSlide[] = [
  {
    id: 1,
    title: "Discover",
    subtitle: "African Services",
    description: "Find authentic African businesses and services in your community. From hair braiding to traditional cuisine, connect with your culture.",
    icon: "compass",
    color: "#FF6B35",
    gradient: ["#FF6B35", "#F7931E"]
  },
  {
    id: 2,
    title: "Connect",
    subtitle: "with Community",
    description: "Build meaningful connections with African entrepreneurs and service providers. Support local businesses and grow together.",
    icon: "people",
    color: "#4ECDC4",
    gradient: ["#4ECDC4", "#44A08D"]
  },
  {
    id: 3,
    title: "Book & Enjoy",
    subtitle: "Seamless Experience",
    description: "Schedule appointments, make secure payments, and enjoy hassle-free service booking. Your African marketplace awaits.",
    icon: "calendar",
    color: "#A8E6CF",
    gradient: ["#A8E6CF", "#7FCDCD"]
  }
];

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { markOnboardingComplete } = useAuth();

  const nextSlide = () => {
    if (currentSlide < onboardingData.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: currentSlide + 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentSlide(currentSlide + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      router.push('/signup');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: currentSlide - 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentSlide(currentSlide - 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const skip = async () => {
    await markOnboardingComplete();
    router.push('/signin');
  };

  const currentData = onboardingData[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={currentData.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.patternDot,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  opacity: Math.random() * 0.3,
                }
              ]}
            />
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={skip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name={currentData.icon} size={80} color="white" />
          </View>

          {/* Title */}
          <Text style={styles.title}>{currentData.title}</Text>
          <Text style={styles.subtitle}>{currentData.subtitle}</Text>
          
          {/* Description */}
          <Text style={styles.description}>{currentData.description}</Text>

          {/* Slide Indicators */}
          <View style={styles.indicators}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentSlide ? styles.activeIndicator : styles.inactiveIndicator
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={prevSlide}
            style={[styles.navButton, currentSlide === 0 && styles.disabledButton]}
            disabled={currentSlide === 0}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={nextSlide} style={styles.nextButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.nextButtonGradient}
            >
              {currentSlide === onboardingData.length - 1 ? (
                <Text style={styles.nextButtonText}>Get Started</Text>
              ) : (
                <Ionicons name="chevron-forward" size={24} color="white" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.bottomText}>
            Already have an account?{' '}
            <Text style={styles.linkText} onPress={() => router.push('/(auth)/signin')}>
              Sign In
            </Text>
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 50,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: 'white',
  },
  inactiveIndicator: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  disabledButton: {
    opacity: 0.3,
  },
  nextButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    height: 50,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  bottomText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  linkText: {
    color: 'white',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
}); 