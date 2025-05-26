import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  backgroundColor: [string, string];
  iconName: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to AfroBiz Connect',
    subtitle: 'Your Gateway to African Excellence',
    description: 'Discover authentic African services from skilled professionals in your community. From traditional crafts to modern solutions.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    backgroundColor: ['#FF6B35', '#FF8E53'],
    iconName: 'account-group',
  },
  {
    id: '2',
    title: 'Authentic African Services',
    subtitle: 'Heritage Meets Innovation',
    description: 'Connect with verified professionals offering traditional African services, crafts, cuisine, and cultural experiences.',
    image: 'https://images.unsplash.com/photo-1594736797933-d0a85a1b6e18?w=400&h=300&fit=crop',
    backgroundColor: ['#8B5CF6', '#A78BFA'],
    iconName: 'star-circle',
  },
  {
    id: '3',
    title: 'Seamless Booking',
    subtitle: 'Book with Confidence',
    description: 'Easy scheduling, secure payments, and real-time communication with service providers. Your satisfaction is guaranteed.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    backgroundColor: ['#10B981', '#34D399'],
    iconName: 'calendar-check',
  },
  {
    id: '4',
    title: 'Support African Business',
    subtitle: 'Empowering Communities',
    description: 'Every booking supports African entrepreneurs and preserves cultural traditions while building stronger communities.',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop',
    backgroundColor: ['#F59E0B', '#FBBF24'],
    iconName: 'heart-multiple',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    animateSlide();
  }, [currentSlide]);

  const animateSlide = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const nextSlide = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      router.replace('/welcome');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      const prevIndex = currentSlide - 1;
      setCurrentSlide(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const skipOnboarding = () => {
    router.replace('/welcome');
  };

  const onMomentumScrollEnd = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const isActive = index === currentSlide;
    
    return (
      <View style={[styles.slideContainer, { width }]}>
        <LinearGradient colors={item.backgroundColor} style={styles.slideGradient}>
          <StatusBar barStyle="light-content" backgroundColor={item.backgroundColor[0]} />
          
          <View style={styles.slideHeader}>
            <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.slideContent,
              {
                opacity: isActive ? fadeAnim : 0.6,
                transform: [{ translateY: isActive ? slideAnim : 0 }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <MaterialCommunityIcons 
                  name={item.iconName as any} 
                  size={60} 
                  color="#FFF" 
                />
              </View>
            </View>

            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.slideImage} />
              <View style={styles.imageOverlay} />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
              <Text style={styles.slideDescription}>{item.description}</Text>
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        <View style={styles.pagination}>
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === currentSlide ? '#FFF' : 'rgba(255, 255, 255, 0.4)',
                  width: index === currentSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
      />
      
      {renderPagination()}

      <View style={styles.navigationContainer}>
        <LinearGradient
          colors={onboardingSlides[currentSlide].backgroundColor}
          style={styles.navigationGradient}
        >
          <TouchableOpacity
            onPress={prevSlide}
            style={[styles.navButton, { opacity: currentSlide === 0 ? 0.3 : 1 }]}
            disabled={currentSlide === 0}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentSlide + 1} of {onboardingSlides.length}
            </Text>
          </View>

          <TouchableOpacity onPress={nextSlide} style={styles.navButton}>
            {currentSlide === onboardingSlides.length - 1 ? (
              <View style={styles.getStartedButton}>
                <Text style={styles.getStartedText}>Get Started</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
              </View>
            ) : (
              <MaterialCommunityIcons name="arrow-right" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  slideContainer: {
    flex: 1,
  },
  slideGradient: {
    flex: 1,
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  slideImage: {
    width: width * 0.8,
    height: 200,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  slideSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navigationGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  getStartedText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
}); 