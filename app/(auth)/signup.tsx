import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../contexts/AuthContext';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'customer' as 'customer' | 'business'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, markOnboardingComplete } = useAuth();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        userType: formData.userType,
        password: formData.password,
      });
      
      // Mark onboarding as complete since user came from onboarding
      await markOnboardingComplete();
      
      Alert.alert(
        'Success!',
        'Account created successfully! Welcome to AfroBiz Connect.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)/')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} signup will be available soon!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <BlurView intensity={20} style={styles.formContainer}>
            {/* Logo/Icon */}
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="storefront" size={40} color="#FF6B35" />
              </View>
              <Text style={styles.title}>Join AfroBiz Connect</Text>
              <Text style={styles.subtitle}>
                Connect with African services and community
              </Text>
            </View>

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <Text style={styles.userTypeLabel}>I want to:</Text>
              <View style={styles.userTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === 'customer' && styles.userTypeButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, userType: 'customer' })}
                >
                  <Ionicons name="person" size={20} color={formData.userType === 'customer' ? 'white' : '#666'} />
                  <Text style={[
                    styles.userTypeButtonText,
                    formData.userType === 'customer' && styles.userTypeButtonTextActive
                  ]}>
                    Find Services
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === 'business' && styles.userTypeButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, userType: 'business' })}
                >
                  <Ionicons name="briefcase" size={20} color={formData.userType === 'business' ? 'white' : '#666'} />
                  <Text style={[
                    styles.userTypeButtonText,
                    formData.userType === 'business' && styles.userTypeButtonTextActive
                  ]}>
                    Offer Services
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Name Fields */}
              <View style={styles.nameRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              {(errors.firstName || errors.lastName) && (
                <Text style={styles.errorText}>
                  {errors.firstName || errors.lastName}
                </Text>
              )}

              {/* Email */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              {/* Phone */}
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

              {/* Password */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                style={styles.signUpButtonGradient}
              >
                {isLoading ? (
                  <Text style={styles.signUpButtonText}>Creating Account...</Text>
                ) : (
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign up with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Sign Up */}
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignUp('Google')}
              >
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignUp('Facebook')}
              >
                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignUp('Apple')}
              >
                <Ionicons name="logo-apple" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>
                Already have an account?{' '}
                <Text style={styles.signInLink} onPress={() => router.push('/(auth)/signin')}>
                  Sign In
                </Text>
              </Text>
            </View>
          </BlurView>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  userTypeContainer: {
    marginBottom: 24,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  userTypeButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  userTypeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  userTypeButtonTextActive: {
    color: 'white',
  },
  form: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  signUpButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInContainer: {
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signInLink: {
    color: '#FF6B35',
    fontWeight: '600',
  },
}); 