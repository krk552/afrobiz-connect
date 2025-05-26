import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../contexts/AuthContext';

export default function SignInScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signIn(formData.email, formData.password);
      // Navigation will be handled automatically by the auth state change
    } catch (error) {
      Alert.alert('Error', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} signin will be available soon!`);
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality will be available soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4ECDC4', '#44A08D']}
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
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <BlurView intensity={20} style={styles.formContainer}>
            {/* Logo/Icon */}
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="storefront" size={40} color="#4ECDC4" />
              </View>
              <Text style={styles.title}>Sign in to AfroBiz</Text>
              <Text style={styles.subtitle}>
                Continue to your African marketplace
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
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

              {/* Forgot Password */}
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.signInButtonGradient}
              >
                {isLoading ? (
                  <Text style={styles.signInButtonText}>Signing In...</Text>
                ) : (
                  <Text style={styles.signInButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign in with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Sign In */}
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignIn('Google')}
              >
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignIn('Facebook')}
              >
                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignIn('Apple')}
              >
                <Ionicons name="logo-apple" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                Don't have an account?{' '}
                <Text style={styles.signUpLink} onPress={() => router.push('/(auth)/signup')}>
                  Sign Up
                </Text>
              </Text>
            </View>
          </BlurView>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
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
    paddingVertical: 16,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
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
    marginBottom: 32,
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
  signUpContainer: {
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signUpLink: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
}); 