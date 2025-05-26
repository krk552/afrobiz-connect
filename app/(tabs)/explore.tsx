import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBooking } from '../../contexts/BookingContext';
import { Service } from '../../services/bookingService';

const { width: screenWidth } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

interface Filter {
  priceRange: { min: number; max: number };
  rating: number;
  location: string;
  categories: string[];
}

export default function ExploreScreen() {
  const { 
    services, 
    isLoadingServices, 
    loadServices, 
    searchServices,
    error,
    clearError 
  } = useBooking();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<Filter>({
    priceRange: { min: 0, max: 10000 },
    rating: 0,
    location: '',
    categories: [],
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'distance'>('rating');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadData();
    animateEntrance();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedCategory, filters, services, sortBy]);

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

  const loadData = async () => {
    try {
      // Load services from API
      await loadServices();
      
      // Mock categories - in real app, this would come from API
      const mockCategories: Category[] = [
        { id: 'all', name: 'All', icon: 'grid', count: 0, color: '#FF6B35' },
        { id: 'Beauty', name: 'Beauty & Hair', icon: 'cut', count: 45, color: '#FF8A80' },
        { id: 'Food', name: 'Food & Catering', icon: 'restaurant', count: 32, color: '#81C784' },
        { id: 'Fashion', name: 'Fashion', icon: 'shirt', count: 28, color: '#9575CD' },
        { id: 'Home', name: 'Home Services', icon: 'home', count: 52, color: '#64B5F6' },
        { id: 'Technology', name: 'Tech Support', icon: 'laptop', count: 19, color: '#FFB74D' },
        { id: 'Fitness', name: 'Fitness', icon: 'fitness', count: 23, color: '#4DB6AC' },
      ];

      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading explore data:', error);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filter by rating
    if (filters.rating > 0) {
      filtered = filtered.filter(service => (service.rating || 0) >= filters.rating);
    }

    // Filter by price range
    filtered = filtered.filter(service => {
      const price = service.price.amount;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price':
          return a.price.amount - b.price.amount;
        case 'distance':
          // Mock distance sorting - in real app would use actual location
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });

    setFilteredServices(filtered);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length > 2) {
      try {
        const results = await searchServices(query);
        setFilteredServices(results);
      } catch (error) {
        console.error('Search error:', error);
      }
    }
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

  const renderServiceCard = ({ item }: { item: Service }) => {
    return (
      <Animated.View style={[styles.serviceCard, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.serviceCardContent}
          onPress={() => router.push(`/service/${item.id}` as any)}
          activeOpacity={0.9}
        >
          <View style={styles.serviceImageContainer}>
            <Image source={{ uri: getServiceImage(item) }} style={styles.serviceImage} />
            {item.rating && item.rating > 4.5 && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              </View>
            )}
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.serviceInfo}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceCategory}>{item.category.toUpperCase()}</Text>
              {item.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            <Text style={styles.serviceName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.serviceProvider} numberOfLines={1}>Business Service</Text>

            <View style={styles.serviceDetails}>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={12} color="#6B7280" />
                <Text style={styles.location}>
                  {item.location?.address || 'Location available'}
                </Text>
              </View>
              <View style={styles.responseTimeContainer}>
                <Ionicons name="time" size={12} color="#6B7280" />
                <Text style={styles.responseTime}>Quick response</Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {item.features.slice(0, 2).map((feature, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.serviceFooter}>
              <Text style={styles.price}>{formatPrice(item)}</Text>
              <TouchableOpacity style={styles.bookButton}>
                <LinearGradient
                  colors={['#FF6B35', '#F7931E']}
                  style={styles.bookGradient}
                >
                  <Text style={styles.bookText}>Book Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSelected && styles.categoryItemSelected,
        ]}
        onPress={() => setSelectedCategory(item.id)}
      >
        <LinearGradient
          colors={isSelected ? [item.color, `${item.color}CC`] : ['#FFF', '#F8F9FA']}
          style={styles.categoryGradient}
        >
          <Ionicons
            name={item.icon as any}
            size={20}
            color={isSelected ? '#FFF' : item.color}
          />
          <Text
            style={[
              styles.categoryName,
              { color: isSelected ? '#FFF' : '#1F2937' },
            ]}
          >
            {item.name}
          </Text>
          {item.count > 0 && (
            <Text
              style={[
                styles.categoryCount,
                { color: isSelected ? 'rgba(255,255,255,0.8)' : '#6B7280' },
              ]}
            >
              {item.count}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services, providers..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.filterGradient}
            >
              <Ionicons name="options" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => renderCategoryItem({ item: category }))}
          </View>

          <View style={styles.viewControls}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid" size={16} color={viewMode === 'grid' ? '#FF6B35' : '#6B7280'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={16} color={viewMode === 'list' ? '#FF6B35' : '#6B7280'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredServices.length} services found
          </Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortText}>Sort: {sortBy}</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
        {isLoadingServices ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredServices}
            renderItem={renderServiceCard}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode}
            contentContainerStyle={styles.servicesList}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.1}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No services found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or filters
                </Text>
              </View>
            }
          />
        )}
      </Animated.View>

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Services</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
                <View style={styles.ratingFilter}>
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.ratingOption,
                        filters.rating === rating && styles.ratingOptionSelected,
                      ]}
                      onPress={() => setFilters({ ...filters, rating })}
                    >
                      <Ionicons name="star" size={16} color="#FFB800" />
                      <Text style={styles.ratingText}>{rating}+</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Location</Text>
                <TextInput
                  style={styles.locationInput}
                  placeholder="Enter location..."
                  value={filters.location}
                  onChangeText={(location) => setFilters({ ...filters, location })}
                />
              </View>

              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() =>
                    setFilters({
                      priceRange: { min: 0, max: 10000 },
                      rating: 0,
                      location: '',
                      categories: [],
                    })
                  }
                >
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setIsFilterModalVisible(false)}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#F7931E']}
                    style={styles.applyGradient}
                  >
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  filterButton: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  filterGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  categoryItem: {
    marginRight: 8,
  },
  categoryItemSelected: {},
  categoryGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  categoryCount: {
    fontSize: 10,
    marginTop: 2,
  },
  viewControls: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: '#FFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  content: {
    flex: 1,
  },
  servicesList: {
    padding: 20,
  },
  serviceCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  serviceCardContent: {},
  serviceImageContainer: {
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 6,
  },
  serviceInfo: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B35',
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rating: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 2,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  serviceProvider: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  location: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  responseTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseTime: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    color: '#6B7280',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  bookButton: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  bookGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bookText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
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
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  ratingFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  ratingOptionSelected: {
    backgroundColor: '#FF6B35',
  },
  ratingText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 4,
  },
  locationInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
    marginLeft: 8,
  },
  applyGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
}); 