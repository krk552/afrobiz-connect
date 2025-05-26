import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalEarnings: number;
  monthlyEarnings: number;
  totalBookings: number;
  activeServices: number;
  averageRating: number;
  completionRate: number;
  responseTime: string;
  topPerformingService: string;
}

interface BookingTrend {
  month: string;
  bookings: number;
  earnings: number;
}

interface ServicePerformance {
  id: string;
  name: string;
  bookings: number;
  earnings: number;
  rating: number;
  category: string;
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  action: () => void;
  badge?: number;
}

export default function DashboardScreen() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [servicePerformance, setServicePerformance] = useState<ServicePerformance[]>([]);
  const [isAddServiceModalVisible, setIsAddServiceModalVisible] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadDashboardData();
    animateEntrance();
  }, []);

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

  const loadDashboardData = () => {
    // Mock analytics data
    const mockAnalytics: AnalyticsData = {
      totalEarnings: 2450.75,
      monthlyEarnings: 850.25,
      totalBookings: 47,
      activeServices: 6,
      averageRating: 4.8,
      completionRate: 96,
      responseTime: '2 mins',
      topPerformingService: 'Hair Braiding & Styling',
    };

    // Mock booking trends
    const mockTrends: BookingTrend[] = [
      { month: 'Jan', bookings: 8, earnings: 420 },
      { month: 'Feb', bookings: 12, earnings: 580 },
      { month: 'Mar', bookings: 15, earnings: 750 },
      { month: 'Apr', bookings: 18, earnings: 920 },
      { month: 'May', bookings: 22, earnings: 1150 },
      { month: 'Jun', bookings: 17, earnings: 850 },
    ];

    // Mock service performance
    const mockServices: ServicePerformance[] = [
      {
        id: '1',
        name: 'Hair Braiding & Styling',
        bookings: 15,
        earnings: 750,
        rating: 4.9,
        category: 'Beauty',
      },
      {
        id: '2',
        name: 'Traditional Catering',
        bookings: 8,
        earnings: 580,
        rating: 4.8,
        category: 'Food',
      },
      {
        id: '3',
        name: 'Custom Tailoring',
        bookings: 12,
        earnings: 420,
        rating: 4.7,
        category: 'Fashion',
      },
      {
        id: '4',
        name: 'House Cleaning',
        bookings: 18,
        earnings: 360,
        rating: 4.6,
        category: 'Home',
      },
    ];

    setAnalyticsData(mockAnalytics);
    setBookingTrends(mockTrends);
    setServicePerformance(mockServices);
  };

  const handleAddService = () => {
    if (newService.name && newService.category && newService.price) {
      // In real app, this would make an API call
      Alert.alert('Success', 'Service added successfully!');
      setNewService({ name: '', category: '', price: '', description: '' });
      setIsAddServiceModalVisible(false);
    } else {
      Alert.alert('Error', 'Please fill in all required fields.');
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'add-service',
      title: 'Add Service',
      icon: 'plus-circle',
      color: '#4CAF50',
      action: () => setIsAddServiceModalVisible(true),
    },
    {
      id: 'manage-bookings',
      title: 'Manage Bookings',
      icon: 'calendar',
      color: '#2196F3',
      action: () => Alert.alert('Bookings', 'Manage bookings coming soon'),
      badge: 3,
    },
    {
      id: 'view-reviews',
      title: 'View Reviews',
      icon: 'star',
      color: '#FF9800',
      action: () => Alert.alert('Reviews', 'Review management coming soon'),
    },
    {
      id: 'analytics',
      title: 'Detailed Analytics',
      icon: 'trending-up',
      color: '#9C27B0',
      action: () => Alert.alert('Analytics', 'Detailed analytics coming soon'),
    },
  ];

  const renderMetricCard = (title: string, value: string, subtitle: string, icon: string, color: string) => (
    <Animated.View
      style={[
        styles.metricCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={icon as any} size={24} color={color} />
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </Animated.View>
  );

  const renderQuickAction = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionCard}
      onPress={action.action}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
        <MaterialCommunityIcons name={action.icon as any} size={28} color={action.color} />
        {action.badge && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{action.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
    </TouchableOpacity>
  );

  const renderServicePerformanceItem = (service: ServicePerformance) => (
    <View key={service.id} style={styles.serviceItem}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.serviceCategory}>{service.category}</Text>
      </View>
      <View style={styles.serviceStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{service.bookings}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>N${service.earnings}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.statValue}>{service.rating}</Text>
          </View>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>
    </View>
  );

  const renderTrendChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Booking Trends (Last 6 Months)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
        {bookingTrends.map((trend, index) => {
          const maxBookings = Math.max(...bookingTrends.map(t => t.bookings));
          const height = (trend.bookings / maxBookings) * 80;
          
          return (
            <View key={trend.month} style={styles.chartBar}>
              <Text style={styles.chartEarnings}>N${trend.earnings}</Text>
              <View style={[styles.bar, { height }]}>
                <LinearGradient
                  colors={['#FF6B35', '#FF8E53']}
                  style={styles.barGradient}
                />
              </View>
              <Text style={styles.chartBookings}>{trend.bookings}</Text>
              <Text style={styles.chartMonth}>{trend.month}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  if (!analyticsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={40} color="#FF6B35" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#FF8E53']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Business Dashboard</Text>
        <Text style={styles.headerSubtitle}>Track your business performance</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Overview Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Total Earnings',
              `N$${analyticsData.totalEarnings.toFixed(2)}`,
              `N$${analyticsData.monthlyEarnings} this month`,
              'cash',
              '#4CAF50'
            )}
            {renderMetricCard(
              'Total Bookings',
              analyticsData.totalBookings.toString(),
              `${analyticsData.activeServices} active services`,
              'calendar-check',
              '#2196F3'
            )}
            {renderMetricCard(
              'Average Rating',
              analyticsData.averageRating.toString(),
              `${analyticsData.completionRate}% completion rate`,
              'star',
              '#FFD700'
            )}
            {renderMetricCard(
              'Response Time',
              analyticsData.responseTime,
              'Average response time',
              'clock-fast',
              '#9C27B0'
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Booking Trends Chart */}
        <View style={styles.section}>
          {renderTrendChart()}
        </View>

        {/* Service Performance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service Performance</Text>
            <TouchableOpacity onPress={() => Alert.alert('Services', 'View all services coming soon')}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.servicePerformanceContainer}>
            {servicePerformance.map(renderServicePerformanceItem)}
          </View>
        </View>

        {/* Top Performing Service Highlight */}
        <View style={styles.section}>
          <View style={styles.highlightCard}>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.highlightGradient}
            >
              <MaterialCommunityIcons name="trophy" size={32} color="#FFF" />
              <Text style={styles.highlightTitle}>Top Performing Service</Text>
              <Text style={styles.highlightService}>{analyticsData.topPerformingService}</Text>
              <Text style={styles.highlightSubtitle}>Leading in bookings and earnings</Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      {/* Add Service Modal */}
      <Modal
        visible={isAddServiceModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsAddServiceModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Service</Text>
            <TouchableOpacity onPress={handleAddService}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newService.name}
                onChangeText={(text) => setNewService(prev => ({ ...prev, name: text }))}
                placeholder="Enter service name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category *</Text>
              <TextInput
                style={styles.textInput}
                value={newService.category}
                onChangeText={(text) => setNewService(prev => ({ ...prev, category: text }))}
                placeholder="e.g., Beauty, Food, Fashion"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price (N$) *</Text>
              <TextInput
                style={styles.textInput}
                value={newService.price}
                onChangeText={(text) => setNewService(prev => ({ ...prev, price: text }))}
                placeholder="Enter price"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newService.description}
                onChangeText={(text) => setNewService(prev => ({ ...prev, description: text }))}
                placeholder="Describe your service..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
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
    backgroundColor: '#F9FAFB',
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFE4D6',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  viewAllButton: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  chartScroll: {
    flexDirection: 'row',
  },
  chartBar: {
    alignItems: 'center',
    marginRight: 20,
    width: 50,
  },
  chartEarnings: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  bar: {
    width: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  barGradient: {
    flex: 1,
    borderRadius: 4,
  },
  chartBookings: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  chartMonth: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  servicePerformanceContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  serviceStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: 16,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  highlightGradient: {
    padding: 24,
    alignItems: 'center',
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 8,
  },
  highlightService: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  highlightSubtitle: {
    fontSize: 14,
    color: '#E8F5E8',
    textAlign: 'center',
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
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
}); 