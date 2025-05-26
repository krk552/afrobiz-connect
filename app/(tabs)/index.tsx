import React, { useState, useEffect, useRef } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StatusBar, 
  StyleSheet, 
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { Service } from '../../services/bookingService';
import ServiceCard from '../../components/ServiceCard';

const { width: screenWidth } = Dimensions.get('window');

interface TrendingCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  gradient: [string, string];
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
}

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { 
    featuredServices, 
    isLoadingServices, 
    loadFeaturedServices, 
    searchServices,
    error,
    clearError
  } = useBooking();
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Service[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const trendingCategories: TrendingCategory[] = [
    { id: '1', name: 'Beauty & Hair', icon: 'cut', count: 145, gradient: ['#FF8A80', '#FF5722'] },
    { id: '2', name: 'Food & Catering', icon: 'restaurant', count: 89, gradient: ['#81C784', '#4CAF50'] },
    { id: '3', name: 'Fashion & Tailoring', icon: 'shirt', count: 67, gradient: ['#9575CD', '#673AB7'] },
    { id: '4', name: 'Home Services', icon: 'home', count: 124, gradient: ['#64B5F6', '#2196F3'] },
  ];

  const quickActions: QuickAction[] = [
    { id: '1', title: 'Book Now', icon: 'calendar', color: '#FF6B35', route: '/(tabs)/bookings' },
    { id: '2', title: 'Messages', icon: 'chatbubble', color: '#4ECDC4', route: '/chat' },
    { id: '3', title: 'Favorites', icon: 'heart', color: '#FF8A80', route: '/(tabs)/explore' },
    { id: '4', title: 'Support', icon: 'help-circle', color: '#A8E6CF', route: '/(tabs)/profile' },
  ];

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  const initializeScreen = async () => {
    try {
      // Load featured services
      await loadFeaturedServices();
      
      // Animate entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

    } catch (error) {
      console.error('Error initializing home screen:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 1200);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length > 2) {
      setIsSearching(true);
      try {
        const results = await searchServices(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleServicePress = (service: Service) => {
    router.push(`/service/${service.id}` as any);
  };

  const handleBookPress = (service: Service) => {
    router.push({
      pathname: '/(tabs)/bookings',
      params: { serviceId: service.id }
    } as any);
  };

  const handleQuickAction = (action: QuickAction) => {
    router.push(action.route as any);
  };

  const handleCategoryPress = (category: TrendingCategory) => {
    router.push({
      pathname: '/(tabs)/explore',
      params: { category: category.name }
    } as any);
  };

  const formatPrice = (service: Service) => {
    const { price } = service;
    if (price.type === 'fixed') {
      return `${price.currency} ${price.amount}`;
    } else if (price.type === 'hourly') {
      return `${price.currency} ${price.amount}/hr`;
    }
    return `${price.currency} ${price.amount}`;
  };

  const getServiceImage = (service: Service) => {
    return service.gallery?.[0] || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={['#FF8C61', '#F7931E']}
          style={styles.loadingGradient}
        >
          <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#FFF', 'rgba(255,255,255,0.8)']}
                style={styles.logoGradient}
              >
                <Ionicons name="storefront" size={48} color="#FF6B35" />
              </LinearGradient>
            </View>
            <Text style={styles.loadingTitle}>AfroBiz Connect</Text>
            <Text style={styles.loadingSubtitle}>Connecting Africa's finest services</Text>
            <ActivityIndicator size="large" color="#FFF" style={styles.loader} />
          </Animated.View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Enhanced Header with Glassmorphism */}
        <LinearGradient
          colors={['#FF8C61', '#F7931E', '#FFB74D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Animated.View style={[styles.header, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {user?.firstName?.charAt(0) || 'G'}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.firstName || 'Guest'}!</Text>
                <Text style={styles.subGreeting}>Discover amazing African services</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                style={styles.notificationGradient}
              >
                <Ionicons name="notifications-outline" size={24} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Enhanced Search Bar */}
          <Animated.View style={[styles.searchContainer, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for services..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {isSearching && (
                <ActivityIndicator size="small" color="#FF6B35" style={styles.searchLoader} />
              )}
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => handleQuickAction(action)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={24} color="#FFF" />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Services</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {isLoadingServices ? (
            <View style={styles.loadingServices}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Loading services...</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
              {featuredServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => handleServicePress(service)}
                  activeOpacity={0.9}
                >
                  <View style={styles.serviceImageContainer}>
                    <Image 
                      source={{ uri: getServiceImage(service) }} 
                      style={styles.serviceImage}
                      resizeMode="cover"
                    />
                    {service.rating && service.rating > 4.5 && (
                      <LinearGradient
                        colors={['#FF6B35', '#F7931E']}
                        style={styles.popularBadge}
                      >
                        <Ionicons name="star" size={12} color="#FFF" />
                        <Text style={styles.popularText}>Popular</Text>
                      </LinearGradient>
                    )}
                    <TouchableOpacity style={styles.favoriteButton}>
                      <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']}
                        style={styles.favoriteGradient}
                      >
                        <Ionicons name="heart-outline" size={16} color="#FFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.serviceContent}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceCategory}>{service.category}</Text>
                      {service.rating && (
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text style={styles.rating}>{service.rating.toFixed(1)}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.serviceName} numberOfLines={2}>{service.name}</Text>
                    <Text style={styles.serviceProvider} numberOfLines={1}>Business Service</Text>
                    <View style={styles.serviceFooter}>
                      <Text style={styles.price}>{formatPrice(service)}</Text>
                      <TouchableOpacity style={styles.bookButton} onPress={() => handleBookPress(service)}>
                        <LinearGradient
                          colors={['#FF6B35', '#F7931E']}
                          style={styles.bookGradient}
                        >
                          <Text style={styles.bookText}>Book</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Enhanced Trending Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.viewAll}>Explore</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesGrid}>
            {trendingCategories.map((category, index) => (
              <Animated.View
                key={category.id}
                style={[
                  styles.categoryWrapper,
                  {
                    transform: [{
                      scale: scaleAnim.interpolate({
                        inputRange: [0.95, 1],
                        outputRange: [0.9, 1],
                      })
                    }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FFF', '#FAFAFA']}
                    style={styles.categoryGradient}
                  >
                    <LinearGradient
                      colors={category.gradient}
                      style={styles.categoryIcon}
                    >
                      <Ionicons name={category.icon as any} size={24} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <View style={styles.categoryMeta}>
                      <Text style={styles.categoryCount}>{category.count} services</Text>
                      <Ionicons name="chevron-forward" size={14} color="#999" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['rgba(255, 107, 53, 0.1)', 'rgba(247, 147, 30, 0.05)']}
            style={styles.statsGradient}
          >
            <Text style={styles.statsTitle}>Join Our Growing Community</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1,247+</Text>
                <Text style={styles.statLabel}>Active Providers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>15K+</Text>
                <Text style={styles.statLabel}>Happy Customers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.9★</Text>
                <Text style={styles.statLabel}>Average Rating</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 32,
    textAlign: 'center',
  },
  loader: {
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  notificationButton: {
    marginLeft: 16,
  },
  notificationGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  searchContainer: {
    marginTop: 8,
  },
  searchInputContainer: {
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  searchLoader: {
    marginLeft: 12,
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    zIndex: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewAll: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  loadingServices: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  featuredScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  serviceCard: {
    width: 300,
    marginRight: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  serviceImageContainer: {
    height: 200,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  categoryCard: {
    overflow: 'hidden',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryGradient: {
    padding: 20,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  statsContainer: {
    marginHorizontal: 24,
    marginTop: 32,
    overflow: 'hidden',
    borderRadius: 20,
  },
  statsGradient: {
    padding: 24,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    marginHorizontal: 16,
  },
});
