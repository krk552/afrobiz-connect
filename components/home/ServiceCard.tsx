import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface FeaturedService {
  id: string;
  name: string;
  provider: string;
  rating: number;
  price: string;
  image: string;
  category: string;
  isPopular?: boolean;
}

interface ServiceCardProps {
  service: FeaturedService;
  onPress: () => void;
  style?: any;
}

export default function ServiceCard({ service, onPress, style }: ServiceCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.serviceImageContainer}>
          <Image source={{ uri: service.image }} style={styles.serviceImage} />
          {service.isPopular && (
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.popularBadge}
            >
              <Ionicons name="flame" size={12} color="#FFF" />
              <Text style={styles.popularText}>Popular</Text>
            </LinearGradient>
          )}
          <TouchableOpacity style={styles.favoriteButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.favoriteGradient}
            >
              <Ionicons name="heart-outline" size={16} color="#FF6B35" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <LinearGradient
          colors={['#FFF', '#FAFAFA']}
          style={styles.serviceContent}
        >
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceCategory}>{service.category}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <Text style={styles.rating}>{service.rating}</Text>
            </View>
          </View>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceProvider}>{service.provider}</Text>
          <View style={styles.serviceFooter}>
            <Text style={styles.price}>{service.price}</Text>
            <TouchableOpacity style={styles.bookButton}>
              <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                style={styles.bookGradient}
              >
                <Text style={styles.bookText}>Book</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  serviceCard: {
    width: 300,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  serviceImageContainer: {
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  favoriteGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceContent: {
    padding: 20,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rating: {
    marginLeft: 2,
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 24,
  },
  serviceProvider: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  bookButton: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  bookGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bookText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
}); 