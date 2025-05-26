import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface Booking {
  id: string;
  serviceName: string;
  providerName: string;
  providerImage: string;
  serviceImage: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress';
  price: string;
  location: string;
  category: string;
  rating?: number;
  review?: string;
  canCancel: boolean;
  canReschedule: boolean;
  estimatedDuration: string;
}

type BookingTab = 'upcoming' | 'completed' | 'cancelled';

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadBookings();
    animateEntrance();
  }, []);

  useEffect(() => {
    filterBookingsByTab();
  }, [activeTab, bookings]);

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

  const loadBookings = () => {
    // Mock data - in real app, this would come from API
    const mockBookings: Booking[] = [
      {
        id: '1',
        serviceName: 'Premium Hair Braiding',
        providerName: "Esther's African Styles",
        providerImage: 'https://images.unsplash.com/photo-1494790108755-2616b8b8a0a7?w=100&h=100&fit=crop',
        serviceImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
        date: '2024-01-25',
        time: '10:00 AM',
        status: 'upcoming',
        price: 'N$ 450',
        location: 'Windhoek Central',
        category: 'Beauty',
        canCancel: true,
        canReschedule: true,
        estimatedDuration: '3 hours',
      },
      {
        id: '2',
        serviceName: 'Traditional Namibian Cuisine',
        providerName: 'Mama Africa Kitchen',
        providerImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
        serviceImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        date: '2024-01-28',
        time: '2:00 PM',
        status: 'upcoming',
        price: 'N$ 180/person',
        location: 'Katutura',
        category: 'Food',
        canCancel: true,
        canReschedule: true,
        estimatedDuration: '4 hours',
      },
      {
        id: '3',
        serviceName: 'Custom Tailored Suit',
        providerName: "Prosper's Tailoring",
        providerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        serviceImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        date: '2024-01-15',
        time: '11:00 AM',
        status: 'completed',
        price: 'N$ 2500',
        location: 'Klein Windhoek',
        category: 'Fashion',
        canCancel: false,
        canReschedule: false,
        estimatedDuration: '2 hours',
        rating: 5,
        review: 'Excellent work! The suit fits perfectly and the quality is outstanding.',
      },
      {
        id: '4',
        serviceName: 'Deep Cleaning Service',
        providerName: 'Sparkle Clean Pro',
        providerImage: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=100&h=100&fit=crop',
        serviceImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
        date: '2024-01-10',
        time: '9:00 AM',
        status: 'completed',
        price: 'N$ 320',
        location: 'Eros',
        category: 'Home',
        canCancel: false,
        canReschedule: false,
        estimatedDuration: '4 hours',
        rating: 4,
        review: 'Good service, very thorough cleaning. Would recommend!',
      },
      {
        id: '5',
        serviceName: 'Wedding Photography',
        providerName: 'African Moments Studio',
        providerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        serviceImage: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=300&fit=crop',
        date: '2024-01-05',
        time: '1:00 PM',
        status: 'cancelled',
        price: 'N$ 3500',
        location: 'Swakopmund',
        category: 'Photography',
        canCancel: false,
        canReschedule: false,
        estimatedDuration: '8 hours',
      },
    ];

    setBookings(mockBookings);
  };

  const filterBookingsByTab = () => {
    let filtered = bookings;
    
    switch (activeTab) {
      case 'upcoming':
        filtered = bookings.filter(booking => booking.status === 'upcoming' || booking.status === 'in-progress');
        break;
      case 'completed':
        filtered = bookings.filter(booking => booking.status === 'completed');
        break;
      case 'cancelled':
        filtered = bookings.filter(booking => booking.status === 'cancelled');
        break;
    }

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel "${booking.serviceName}"? This action cannot be undone.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => {
            const updatedBookings = bookings.map(b =>
              b.id === booking.id ? { ...b, status: 'cancelled' as const } : b
            );
            setBookings(updatedBookings);
            Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
          },
        },
      ]
    );
  };

  const handleRescheduleBooking = (booking: Booking) => {
    Alert.alert(
      'Reschedule Booking',
      'Reschedule functionality would open a date/time picker here.',
      [{ text: 'OK' }]
    );
  };

  const handleAddReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewRating(booking.rating || 5);
    setReviewText(booking.review || '');
    setIsReviewModalVisible(true);
  };

  const submitReview = () => {
    if (selectedBooking) {
      const updatedBookings = bookings.map(b =>
        b.id === selectedBooking.id
          ? { ...b, rating: reviewRating, review: reviewText }
          : b
      );
      setBookings(updatedBookings);
      setIsReviewModalVisible(false);
      setSelectedBooking(null);
      Alert.alert('Review Submitted', 'Thank you for your feedback!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
      case 'in-progress':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    return (
      <Animated.View style={[styles.bookingCard, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.bookingCardContent}
          onPress={() => {/* router.push(`/booking/${item.id}`) */}}
          activeOpacity={0.9}
        >
          <View style={styles.bookingHeader}>
            <View style={styles.serviceInfo}>
              <Image source={{ uri: item.serviceImage }} style={styles.serviceImage} />
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceName} numberOfLines={2}>
                  {item.serviceName}
                </Text>
                <View style={styles.providerInfo}>
                  <Image source={{ uri: item.providerImage }} style={styles.providerImage} />
                  <Text style={styles.providerName}>{item.providerName}</Text>
                </View>
                <Text style={styles.category}>{item.category}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>

          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {new Date(item.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{item.time} ({item.estimatedDuration})</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="card" size={16} color="#6B7280" />
              <Text style={styles.price}>{item.price}</Text>
            </View>
          </View>

          {item.rating && (
            <View style={styles.reviewSection}>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Your Rating:</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={16}
                      color={star <= item.rating! ? '#FFB800' : '#E5E7EB'}
                    />
                  ))}
                </View>
              </View>
              {item.review && (
                <Text style={styles.reviewText} numberOfLines={2}>
                  "{item.review}"
                </Text>
              )}
            </View>
          )}

          <View style={styles.bookingActions}>
            {item.status === 'upcoming' && (
              <>
                {item.canReschedule && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleRescheduleBooking(item)}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#FF6B35" />
                    <Text style={styles.actionButtonText}>Reschedule</Text>
                  </TouchableOpacity>
                )}
                {item.canCancel && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancelBooking(item)}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#F44336" />
                    <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {item.status === 'completed' && (
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => handleAddReview(item)}
              >
                <LinearGradient
                  colors={['#FF6B35', '#F7931E']}
                  style={styles.reviewButtonGradient}
                >
                  <Ionicons name="star" size={16} color="#FFF" />
                  <Text style={styles.reviewButtonText}>
                    {item.rating ? 'Update Review' : 'Add Review'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="chatbubble-outline" size={16} color="#2196F3" />
              <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>Contact</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => {
    const emptyStateConfig = {
      upcoming: {
        icon: 'calendar-outline',
        title: 'No Upcoming Bookings',
        subtitle: 'Book your first African service today!',
        buttonText: 'Explore Services',
      },
      completed: {
        icon: 'checkmark-circle-outline',
        title: 'No Completed Bookings',
        subtitle: 'Your completed services will appear here.',
        buttonText: 'Browse Services',
      },
      cancelled: {
        icon: 'close-circle-outline',
        title: 'No Cancelled Bookings',
        subtitle: 'Great! You haven\'t cancelled any bookings.',
        buttonText: 'Find Services',
      },
    };

    const config = emptyStateConfig[activeTab];

    return (
      <View style={styles.emptyState}>
        <Ionicons name={config.icon as any} size={64} color="#D1D5DB" />
        <Text style={styles.emptyStateTitle}>{config.title}</Text>
        <Text style={styles.emptyStateSubtitle}>{config.subtitle}</Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            style={styles.exploreButtonGradient}
          >
            <Text style={styles.exploreButtonText}>{config.buttonText}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.calendarButton}>
          <Ionicons name="calendar" size={24} color="#FF6B35" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.tabContainer, { opacity: fadeAnim }]}>
        {(['upcoming', 'completed', 'cancelled'] as BookingTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <LinearGradient
              colors={
                activeTab === tab
                  ? ['#FF6B35', '#F7931E']
                  : ['transparent', 'transparent']
              }
              style={styles.tabGradient}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {bookings.filter(b => 
                    tab === 'upcoming' 
                      ? b.status === 'upcoming' || b.status === 'in-progress'
                      : b.status === tab
                  ).length}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
        {filteredBookings.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredBookings}
            renderItem={renderBookingCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.bookingsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>

      {/* Review Modal */}
      <Modal
        visible={isReviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate & Review</Text>
              <TouchableOpacity onPress={() => setIsReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <View style={styles.reviewContent}>
                <View style={styles.servicePreview}>
                  <Image source={{ uri: selectedBooking.serviceImage }} style={styles.previewImage} />
                  <View>
                    <Text style={styles.previewServiceName}>{selectedBooking.serviceName}</Text>
                    <Text style={styles.previewProviderName}>{selectedBooking.providerName}</Text>
                  </View>
                </View>

                <View style={styles.ratingSection}>
                  <Text style={styles.ratingTitle}>How was your experience?</Text>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setReviewRating(star)}
                      >
                        <Ionicons
                          name="star"
                          size={32}
                          color={star <= reviewRating ? '#FFB800' : '#E5E7EB'}
                          style={styles.ratingStarButton}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.reviewInputSection}>
                  <Text style={styles.reviewInputTitle}>Share your thoughts (optional)</Text>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Tell others about your experience..."
                    value={reviewText}
                    onChangeText={setReviewText}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
                  <LinearGradient
                    colors={['#FF6B35', '#F7931E']}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  calendarButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    marginHorizontal: 4,
    overflow: 'hidden',
    borderRadius: 12,
  },
  activeTab: {},
  tabGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFF',
  },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  bookingsList: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  bookingCardContent: {
    padding: 20,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  providerName: {
    fontSize: 14,
    color: '#6B7280',
  },
  category: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  reviewSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  bookingActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 4,
  },
  reviewButton: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  reviewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  exploreButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  reviewModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  reviewContent: {
    padding: 20,
  },
  servicePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  previewServiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  previewProviderName: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ratingStarButton: {
    marginHorizontal: 4,
  },
  reviewInputSection: {
    marginBottom: 24,
  },
  reviewInputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
  },
  submitButton: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
}); 