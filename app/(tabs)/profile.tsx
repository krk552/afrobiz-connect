import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  joinDate: string;
  isVerified: boolean;
  totalBookings: number;
  favoriteServices: number;
  savedLocations: string[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  badgeText?: string;
  badgeColor?: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    locationServices: true,
    darkMode: false,
    language: 'English',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadUserProfile();
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

  const loadUserProfile = () => {
    // Mock data - in real app, this would come from API
    const mockProfile: UserProfile = {
      id: '1',
      name: 'Amara Nakamura',
      email: 'amara.nakamura@example.com',
      phone: '+264 81 234 5678',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b8b8a0a7?w=200&h=200&fit=crop',
      location: 'Windhoek, Namibia',
      joinDate: '2023-06-15',
      isVerified: true,
      totalBookings: 12,
      favoriteServices: 8,
      savedLocations: ['Windhoek Central', 'Klein Windhoek', 'Katutura'],
    };

    setUserProfile(mockProfile);
    setEditForm({
      name: mockProfile.name,
      email: mockProfile.email,
      phone: mockProfile.phone,
      location: mockProfile.location,
    });
  };

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        ...editForm,
      };
      setUserProfile(updatedProfile);
      setIsEditModalVisible(false);
      Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/welcome');
          },
        },
      ]
    );
  };

  const handleToggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          icon: 'person-outline',
          action: handleEditProfile,
          showArrow: true,
        },
        {
          id: 'payment',
          title: 'Payment Methods',
          subtitle: 'Manage cards and payment options',
          icon: 'card-outline',
          action: () => Alert.alert('Payment', 'Payment methods coming soon'),
          showArrow: true,
        },
        {
          id: 'addresses',
          title: 'Saved Addresses',
          subtitle: `${userProfile?.savedLocations.length || 0} locations saved`,
          icon: 'location-outline',
          action: () => Alert.alert('Addresses', 'Address management coming soon'),
          showArrow: true,
        },
        {
          id: 'verification',
          title: 'Account Verification',
          subtitle: userProfile?.isVerified ? 'Verified account' : 'Verify your account',
          icon: 'shield-checkmark-outline',
          action: () => Alert.alert('Verification', 'Verification settings coming soon'),
          showArrow: true,
          badgeText: userProfile?.isVerified ? 'Verified' : 'Pending',
          badgeColor: userProfile?.isVerified ? '#4CAF50' : '#FF9800',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive booking updates and reminders',
          icon: 'notifications-outline',
          action: () => handleToggleSetting('notifications'),
          showSwitch: true,
          switchValue: settings.notifications,
        },
        {
          id: 'email-updates',
          title: 'Email Updates',
          subtitle: 'Get news and promotions via email',
          icon: 'mail-outline',
          action: () => handleToggleSetting('emailUpdates'),
          showSwitch: true,
          switchValue: settings.emailUpdates,
        },
        {
          id: 'location',
          title: 'Location Services',
          subtitle: 'Find services near you',
          icon: 'location-outline',
          action: () => handleToggleSetting('locationServices'),
          showSwitch: true,
          switchValue: settings.locationServices,
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: settings.language,
          icon: 'language-outline',
          action: () => Alert.alert('Language', 'Language selection coming soon'),
          showArrow: true,
        },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'FAQs and support articles',
          icon: 'help-circle-outline',
          action: () => Alert.alert('Help', 'Help center coming soon'),
          showArrow: true,
        },
        {
          id: 'contact',
          title: 'Contact Support',
          subtitle: 'Get help with your account',
          icon: 'chatbubble-outline',
          action: () => Alert.alert('Contact', 'Support contact coming soon'),
          showArrow: true,
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'How we handle your data',
          icon: 'document-text-outline',
          action: () => Alert.alert('Privacy', 'Privacy policy coming soon'),
          showArrow: true,
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          subtitle: 'Service terms and conditions',
          icon: 'document-outline',
          action: () => Alert.alert('Terms', 'Terms of service coming soon'),
          showArrow: true,
        },
        {
          id: 'about',
          title: 'About AfroBiz Connect',
          subtitle: 'Version 1.0.0',
          icon: 'information-circle-outline',
          action: () => Alert.alert('About', 'AfroBiz Connect v1.0.0\nConnecting African services worldwide'),
          showArrow: true,
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          id: 'logout',
          title: 'Logout',
          subtitle: 'Sign out of your account',
          icon: 'log-out-outline',
          action: handleLogout,
          showArrow: false,
        },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem, isLast: boolean) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.menuItem, isLast && styles.menuItemLast]}
        onPress={item.action}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name={item.icon as any} size={20} color="#6B7280" />
            </View>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.menuItemRight}>
            {item.badgeText && (
              <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
                <Text style={styles.badgeText}>{item.badgeText}</Text>
              </View>
            )}
            {item.showSwitch && (
              <Switch
                value={item.switchValue}
                onValueChange={item.action}
                trackColor={{ false: '#E5E7EB', true: '#FF6B35' }}
                thumbColor={item.switchValue ? '#FFF' : '#FFF'}
              />
            )}
            {item.showArrow && (
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStats = () => {
    if (!userProfile) return null;

    const stats = [
      {
        title: 'Total Bookings',
        value: userProfile.totalBookings.toString(),
        icon: 'calendar',
        color: '#4CAF50',
      },
      {
        title: 'Favorite Services',
        value: userProfile.favoriteServices.toString(),
        icon: 'heart',
        color: '#FF6B35',
      },
      {
        title: 'Saved Locations',
        value: userProfile.savedLocations.length.toString(),
        icon: 'location',
        color: '#2196F3',
      },
    ];

    return (
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.headerGradient}
        >
          <View style={styles.profileSection}>
            <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{userProfile.name}</Text>
                {userProfile.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                )}
              </View>
              <Text style={styles.email}>{userProfile.email}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.location}>{userProfile.location}</Text>
              </View>
              <Text style={styles.joinDate}>
                Member since {new Date(userProfile.joinDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderStats()}

          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.menuSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuCard}>
                {section.items.map((item, itemIndex) =>
                  renderMenuItem(item, itemIndex === section.items.length - 1)
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editContent}>
              <View style={styles.avatarSection}>
                <Image source={{ uri: userProfile.avatar }} style={styles.editAvatar} />
                <TouchableOpacity style={styles.changePhotoButton}>
                  <LinearGradient
                    colors={['#FF6B35', '#F7931E']}
                    style={styles.changePhotoGradient}
                  >
                    <Ionicons name="camera" size={16} color="#FFF" />
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.name}
                    onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                    placeholder="Enter your full name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.email}
                    onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.location}
                    onChangeText={(text) => setEditForm({ ...editForm, location: text })}
                    placeholder="Enter your location"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsEditModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <LinearGradient
                    colors={['#FF6B35', '#F7931E']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 8,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  joinDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  editContent: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  changePhotoButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  changePhotoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 6,
  },
  formSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
}); 