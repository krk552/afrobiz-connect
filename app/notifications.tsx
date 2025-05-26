import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'system' | 'promotion' | 'review' | 'payment';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  actionData?: {
    screen?: string;
    params?: any;
  };
}

const notificationTypes = [
  { id: 'all', name: 'All', icon: 'bell', count: 0 },
  { id: 'booking', name: 'Bookings', icon: 'calendar-check', count: 0 },
  { id: 'message', name: 'Messages', icon: 'message-text', count: 0 },
  { id: 'system', name: 'Updates', icon: 'information', count: 0 },
  { id: 'promotion', name: 'Offers', icon: 'tag', count: 0 },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadNotifications();
    animateEntrance();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [selectedFilter, notifications]);

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

  const loadNotifications = () => {
    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your hair braiding appointment with Amara Nakamura has been confirmed for Friday, 2:00 PM.',
        timestamp: new Date(Date.now() - 60000 * 15),
        isRead: false,
        isImportant: true,
        actionData: { screen: '/bookings', params: { tab: 'upcoming' } },
      },
      {
        id: '2',
        type: 'message',
        title: 'New Message from Amara Nakamura',
        message: 'I have slots available at 9 AM, 1 PM, and 4 PM on Friday. Would any of those times work for you?',
        timestamp: new Date(Date.now() - 60000 * 30),
        isRead: false,
        isImportant: false,
        actionData: { screen: '/chat/provider-123' },
      },
      {
        id: '3',
        type: 'promotion',
        title: '20% Off African Cuisine',
        message: 'Get 20% off your first order with Chef Kemi\'s authentic Nigerian dishes. Valid until Sunday!',
        timestamp: new Date(Date.now() - 60000 * 120),
        isRead: true,
        isImportant: false,
        actionData: { screen: '/service/cuisine-123' },
      },
      {
        id: '4',
        type: 'review',
        title: 'Review Reminder',
        message: 'How was your experience with Traditional Kente Weaving? Please leave a review to help other customers.',
        timestamp: new Date(Date.now() - 60000 * 240),
        isRead: false,
        isImportant: false,
        actionData: { screen: '/bookings', params: { tab: 'completed' } },
      },
      {
        id: '5',
        type: 'system',
        title: 'App Update Available',
        message: 'AfroBiz Connect v2.1 is now available with new features and improvements.',
        timestamp: new Date(Date.now() - 60000 * 360),
        isRead: true,
        isImportant: false,
      },
      {
        id: '6',
        type: 'payment',
        title: 'Payment Successful',
        message: 'Your payment of N$120 for Traditional Hair Braiding has been processed successfully.',
        timestamp: new Date(Date.now() - 60000 * 480),
        isRead: true,
        isImportant: false,
        actionData: { screen: '/bookings', params: { tab: 'completed' } },
      },
      {
        id: '7',
        type: 'booking',
        title: 'Booking Reminder',
        message: 'Your appointment with Fitness Training by Kwame is tomorrow at 6:00 PM. Don\'t forget!',
        timestamp: new Date(Date.now() - 60000 * 720),
        isRead: true,
        isImportant: true,
        actionData: { screen: '/bookings', params: { tab: 'upcoming' } },
      },
      {
        id: '8',
        type: 'message',
        title: 'Message from Chef Kemi',
        message: 'Thank you for your order! Your jollof rice and plantain will be ready for pickup at 7:00 PM.',
        timestamp: new Date(Date.now() - 60000 * 1440),
        isRead: true,
        isImportant: false,
        actionData: { screen: '/chat/chef-456' },
      },
    ];

    setNotifications(mockNotifications);
  };

  const filterNotifications = () => {
    let filtered = notifications;
    
    if (selectedFilter !== 'all') {
      filtered = notifications.filter(notification => notification.type === selectedFilter);
    }

    setFilteredNotifications(filtered);

    // Update counts for filter tabs
    notificationTypes.forEach(type => {
      if (type.id === 'all') {
        type.count = notifications.filter(n => !n.isRead).length;
      } else {
        type.count = notifications.filter(n => n.type === type.id && !n.isRead).length;
      }
    });
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );

    // Navigate to relevant screen
    if (notification.actionData?.screen) {
      if (notification.actionData.params) {
        router.push({
          pathname: notification.actionData.screen,
          params: notification.actionData.params,
        });
      } else {
        router.push(notification.actionData.screen);
      }
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setNotifications(prev => prev.filter(n => n.id !== id)),
        },
      ]
    );
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadNotifications();
      setIsRefreshing(false);
    }, 1000);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return 'calendar-check';
      case 'message': return 'message-text';
      case 'system': return 'information';
      case 'promotion': return 'tag';
      case 'review': return 'star';
      case 'payment': return 'credit-card';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return '#10B981';
      case 'message': return '#3B82F6';
      case 'system': return '#6B7280';
      case 'promotion': return '#F59E0B';
      case 'review': return '#8B5CF6';
      case 'payment': return '#EF4444';
      default: return '#FF6B35';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (hours < 1) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderFilterTab = ({ item }: { item: any }) => {
    const isSelected = selectedFilter === item.id;
    return (
      <TouchableOpacity
        style={[styles.filterTab, isSelected && styles.filterTabSelected]}
        onPress={() => setSelectedFilter(item.id)}
      >
        <MaterialCommunityIcons
          name={item.icon as any}
          size={18}
          color={isSelected ? '#FFF' : '#6B7280'}
        />
        <Text
          style={[
            styles.filterTabText,
            { color: isSelected ? '#FFF' : '#6B7280' },
          ]}
        >
          {item.name}
        </Text>
        {item.count > 0 && (
          <View style={[
            styles.countBadge,
            { backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#FF6B35' },
          ]}>
            <Text style={[
              styles.countText,
              { color: isSelected ? '#FFF' : '#FFF' },
            ]}>
              {item.count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    return (
      <Animated.View
        style={[
          styles.notificationCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          !item.isRead && styles.unreadNotification,
        ]}
      >
        <TouchableOpacity
          style={styles.notificationContent}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.notificationIcon,
            { backgroundColor: `${getNotificationColor(item.type)}20` },
          ]}>
            <MaterialCommunityIcons
              name={getNotificationIcon(item.type) as any}
              size={24}
              color={getNotificationColor(item.type)}
            />
          </View>

          <View style={styles.notificationText}>
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
                {item.title}
              </Text>
              {item.isImportant && (
                <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
              )}
            </View>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>

          {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <MaterialCommunityIcons name="close" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="bell-off" size={80} color="#E5E7EB" />
        <Text style={styles.emptyTitle}>No notifications</Text>
        <Text style={styles.emptyMessage}>
          You're all caught up! New notifications will appear here.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Notifications</Text>
        
        <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={notificationTypes}
          renderItem={renderFilterTab}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Notifications List */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {filteredNotifications.length > 0 ? (
          <FlatList
            data={filteredNotifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.notificationsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={['#FF6B35']}
                tintColor="#FF6B35"
              />
            }
          />
        ) : (
          renderEmptyState()
        )}
      </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabSelected: {
    backgroundColor: '#FF6B35',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginLeft: 8,
    marginTop: 4,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 