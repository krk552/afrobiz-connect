import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  rating: number;
  reviewCount: number;
  category: string;
  images: string[];
  provider: {
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    responseTime: string;
    joinedDate: string;
    isVerified: boolean;
  };
  features: string[];
  location: string;
  availability: {
    [key: string]: string[];
  };
}

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  serviceDate: string;
}

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadServiceDetails();
    animateEntrance();
  }, [id]);

  const animateEntrance = () => {
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

  const loadServiceDetails = () => {
    // Mock service data - in real app, this would come from API based on service ID
    const mockService: Service = {
      id: id as string,
      name: 'Professional Hair Braiding & Styling',
      description: 'Traditional African hair braiding with modern techniques. Specializing in protective styles including box braids, cornrows, twists, and ceremonial hairstyles. Using high-quality, natural hair products safe for all hair types.',
      price: 120,
      duration: '2-4 hours',
      rating: 4.8,
      reviewCount: 47,
      category: 'Beauty & Hair',
      images: [
        'https://images.unsplash.com/photo-1594736797933-d0a85a1b6e18?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1619505091215-fa5e35b5e4e4?w=400&h=300&fit=crop',
      ],
      provider: {
        name: 'Amara Nakamura',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b8b8a0a7?w=200&h=200&fit=crop',
        rating: 4.9,
        reviewCount: 128,
        responseTime: '2 mins',
        joinedDate: '2022-03-15',
        isVerified: true,
      },
      features: [
        'Premium natural hair products',
        'Protective styling techniques',
        'Free consultation',
        'Hair care advice included',
        'Flexible scheduling',
        'Mobile service available',
      ],
      location: 'Windhoek Central, Namibia',
      availability: {
        'Mon': ['09:00', '11:00', '14:00', '16:00'],
        'Tue': ['10:00', '13:00', '15:00'],
        'Wed': ['09:00', '11:00', '14:00', '16:00'],
        'Thu': ['10:00', '13:00', '15:00', '17:00'],
        'Fri': ['09:00', '11:00', '14:00'],
        'Sat': ['10:00', '12:00', '14:00', '16:00'],
        'Sun': ['12:00', '14:00'],
      },
    };

    const mockReviews: Review[] = [
      {
        id: '1',
        userName: 'Sarah Kapombe',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Absolutely amazing work! Amara is so skilled and professional. My braids lasted for weeks and looked perfect. Highly recommend!',
        date: '2024-01-15',
        serviceDate: '2024-01-10',
      },
      {
        id: '2',
        userName: 'Grace Mwangi',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Best braiding experience I\'ve had in Windhoek. Very clean workspace, gentle with hair, and great conversation too!',
        date: '2024-01-12',
        serviceDate: '2024-01-08',
      },
      {
        id: '3',
        userName: 'Fatima Al-Rashid',
        userAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop',
        rating: 4,
        comment: 'Great service and very professional. The styling took a bit longer than expected but the results were worth it.',
        date: '2024-01-08',
        serviceDate: '2024-01-05',
      },
    ];

    setService(mockService);
    setReviews(mockReviews);
  };

  const handleBookService = () => {
    if (selectedDate && selectedTime) {
      Alert.alert(
        'Booking Confirmed',
        `Your booking for ${selectedDate} at ${selectedTime} has been confirmed. You will receive a confirmation email shortly.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setIsBookingModalVisible(false);
              router.push('/bookings');
            },
          },
        ]
      );
    } else {
      Alert.alert('Missing Information', 'Please select both date and time for your booking.');
    }
  };

  const renderImageCarousel = () => {
    if (!service) return null;

    return (
      <View style={styles.imageCarousel}>
        <FlatList
          data={service.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setActiveImageIndex(index);
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.serviceImage} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={styles.imageIndicators}>
          {service.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                { opacity: index === activeImageIndex ? 1 : 0.3 },
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderProvider = () => {
    if (!service) return null;

    return (
      <View style={styles.providerSection}>
        <Text style={styles.sectionTitle}>Service Provider</Text>
        <View style={styles.providerCard}>
          <Image source={{ uri: service.provider.avatar }} style={styles.providerAvatar} />
          <View style={styles.providerInfo}>
            <View style={styles.providerNameRow}>
              <Text style={styles.providerName}>{service.provider.name}</Text>
              {service.provider.isVerified && (
                <MaterialCommunityIcons name="check-decagram" size={20} color="#4CAF50" />
              )}
            </View>
            <View style={styles.providerStats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.statText}>
                  {service.provider.rating} ({service.provider.reviewCount})
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="clock-fast" size={16} color="#FF6B35" />
                <Text style={styles.statText}>Responds in {service.provider.responseTime}</Text>
              </View>
            </View>
            <Text style={styles.joinedDate}>
              Joined {new Date(service.provider.joinedDate).toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity style={styles.contactButton}>
            <MaterialCommunityIcons name="message" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderReviews = () => {
    if (!reviews.length) return null;

    return (
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>
        {reviews.slice(0, 2).map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image source={{ uri: review.userAvatar }} style={styles.reviewerAvatar} />
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>{review.userName}</Text>
                <View style={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialCommunityIcons
                      key={star}
                      name="star"
                      size={14}
                      color={star <= review.rating ? '#FFD700' : '#E5E7EB'}
                    />
                  ))}
                  <Text style={styles.reviewDate}>• {review.date}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={40} color="#FF6B35" />
          <Text style={styles.loadingText}>Loading service details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton}>
          <MaterialCommunityIcons name="heart-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        {renderImageCarousel()}

        {/* Service Info */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.serviceHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{service.category}</Text>
            </View>
            <Text style={styles.serviceName}>{service.name}</Text>
            <View style={styles.serviceMetrics}>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
                <Text style={styles.ratingText}>{service.rating}</Text>
                <Text style={styles.reviewCountText}>({service.reviewCount} reviews)</Text>
              </View>
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
                <Text style={styles.locationText}>{service.location}</Text>
              </View>
            </View>
          </View>

          {/* Price and Duration */}
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>N${service.price}</Text>
              <Text style={styles.duration}>Duration: {service.duration}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            <View style={styles.featuresGrid}>
              {service.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Provider */}
          {renderProvider()}

          {/* Reviews */}
          {renderReviews()}
        </Animated.View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookingContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => setIsBookingModalVisible(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF8E53']}
            style={styles.bookButtonGradient}
          >
            <Text style={styles.bookButtonText}>Book Now - N${service.price}</Text>
            <MaterialCommunityIcons name="calendar-plus" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      <Modal
        visible={isBookingModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsBookingModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Book Service</Text>
            <TouchableOpacity onPress={handleBookService}>
              <Text style={styles.confirmButton}>Confirm</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.bookingServiceName}>{service.name}</Text>
            <Text style={styles.bookingPrice}>N${service.price} • {service.duration}</Text>

            <View style={styles.bookingSection}>
              <Text style={styles.bookingSectionTitle}>Select Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.dateOptions}>
                  {Object.keys(service.availability).map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dateOption,
                        selectedDate === day && styles.selectedDateOption,
                      ]}
                      onPress={() => setSelectedDate(day)}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          selectedDate === day && styles.selectedDateOptionText,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {selectedDate && (
              <View style={styles.bookingSection}>
                <Text style={styles.bookingSectionTitle}>Select Time</Text>
                <View style={styles.timeOptions}>
                  {service.availability[selectedDate].map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeOption,
                        selectedTime === time && styles.selectedTimeOption,
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          selectedTime === time && styles.selectedTimeOptionText,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.bookingSection}>
              <Text style={styles.bookingSectionTitle}>Additional Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={bookingNotes}
                onChangeText={setBookingNotes}
                placeholder="Any special requests or notes..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  imageCarousel: {
    height: 300,
    position: 'relative',
  },
  serviceImage: {
    width,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginHorizontal: 4,
  },
  contentContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  serviceHeader: {
    marginBottom: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 32,
  },
  serviceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCountText: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  duration: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresGrid: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 12,
    flex: 1,
  },
  providerSection: {
    marginBottom: 24,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  joinedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsSection: {
    marginBottom: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  bookingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  confirmButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  bookingServiceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  bookingPrice: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 24,
  },
  bookingSection: {
    marginBottom: 24,
  },
  bookingSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  dateOptions: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  selectedDateOption: {
    backgroundColor: '#FF6B35',
  },
  dateOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedDateOptionText: {
    color: '#FFF',
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  selectedTimeOption: {
    backgroundColor: '#FF6B35',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedTimeOptionText: {
    color: '#FFF',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFF',
    height: 80,
    textAlignVertical: 'top',
  },
}); 