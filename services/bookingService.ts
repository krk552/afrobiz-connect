import apiService, { ApiResponse, ApiError } from './api';

// Types
export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly' | 'daily' | 'custom';
  };
  duration?: {
    amount: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  location?: {
    type: 'business' | 'customer' | 'both';
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  availability: ServiceAvailability;
  requirements?: string[];
  features: string[];
  gallery: string[];
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAvailability {
  schedule: {
    [key: string]: {
      isAvailable: boolean;
      slots: TimeSlot[];
    };
  };
  exceptions?: {
    date: string;
    isAvailable: boolean;
    reason?: string;
    slots?: TimeSlot[];
  }[];
  advanceBooking: {
    min: number; // minimum hours in advance
    max: number; // maximum days in advance
  };
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
  isBooked?: boolean;
}

export interface BookingRequest {
  serviceId: string;
  date: string; // YYYY-MM-DD format
  timeSlot: TimeSlot;
  duration?: number; // in minutes
  location?: {
    type: 'business' | 'customer';
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    notes?: string;
  };
  requirements?: string[];
  notes?: string;
  paymentMethod: PaymentMethod;
}

export interface Booking {
  id: string;
  customerId: string;
  businessId: string;
  serviceId: string;
  service: Service;
  status: BookingStatus;
  date: string;
  timeSlot: TimeSlot;
  duration: number;
  location: {
    type: 'business' | 'customer';
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    notes?: string;
  };
  pricing: {
    subtotal: number;
    serviceFee: number;
    taxes: number;
    total: number;
    currency: string;
  };
  payment: PaymentInfo;
  requirements?: string[];
  notes?: string;
  customerNotes?: string;
  businessNotes?: string;
  createdAt: string;
  updatedAt: string;
  confirmationCode: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  REFUNDED = 'refunded',
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'mobile_money' | 'bank_transfer' | 'cash';
  provider?: string; // e.g., 'visa', 'mastercard', 'mtn_mobile_money'
  token?: string; // for saved payment methods
  details?: {
    cardNumber?: string; // masked
    expiryMonth?: number;
    expiryYear?: number;
    holderName?: string;
    phoneNumber?: string; // for mobile money
  };
}

export interface PaymentInfo {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionId?: string;
  processedAt?: string;
  failureReason?: string;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  businessId: string;
  serviceId: string;
  rating: number; // 1-5
  comment?: string;
  images?: string[];
  response?: {
    comment: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingFilters {
  status?: BookingStatus[];
  dateFrom?: string;
  dateTo?: string;
  serviceId?: string;
  businessId?: string;
  customerId?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface AvailabilityQuery {
  serviceId: string;
  date?: string; // specific date or range start
  dateEnd?: string; // range end
  duration?: number; // in minutes
}

// Add mock data at the top of the file after interfaces
const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    businessId: 'business-1',
    name: 'Professional Hair Styling',
    description: 'Expert hair styling and treatment services for all hair types',
    category: 'Beauty',
    subcategory: 'Hair Care',
    price: {
      amount: 150,
      currency: 'NAD',
      type: 'fixed',
    },
    duration: {
      amount: 90,
      unit: 'minutes',
    },
    location: {
      type: 'business',
      address: 'Windhoek, Namibia',
      coordinates: {
        latitude: -22.5609,
        longitude: 17.0658,
      },
    },
    availability: {
      schedule: {
        monday: { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
        tuesday: { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
        wednesday: { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
        thursday: { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
        friday: { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
        saturday: { isAvailable: true, slots: [{ start: '10:00', end: '16:00' }] },
        sunday: { isAvailable: false, slots: [] },
      },
      advanceBooking: { min: 2, max: 30 },
    },
    requirements: ['Clean hair preferred'],
    features: ['Professional styling', 'Hair treatment', 'Consultation'],
    gallery: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop'],
    rating: 4.8,
    reviewCount: 127,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    businessId: 'business-2',
    name: 'Traditional African Cuisine Catering',
    description: 'Authentic African dishes for events and celebrations',
    category: 'Food',
    subcategory: 'Catering',
    price: {
      amount: 80,
      currency: 'NAD',
      type: 'hourly',
    },
    duration: {
      amount: 4,
      unit: 'hours',
    },
    location: {
      type: 'customer',
      address: 'Windhoek Area',
    },
    availability: {
      schedule: {
        monday: { isAvailable: true, slots: [{ start: '08:00', end: '20:00' }] },
        tuesday: { isAvailable: true, slots: [{ start: '08:00', end: '20:00' }] },
        wednesday: { isAvailable: true, slots: [{ start: '08:00', end: '20:00' }] },
        thursday: { isAvailable: true, slots: [{ start: '08:00', end: '20:00' }] },
        friday: { isAvailable: true, slots: [{ start: '08:00', end: '20:00' }] },
        saturday: { isAvailable: true, slots: [{ start: '08:00', end: '20:00' }] },
        sunday: { isAvailable: true, slots: [{ start: '10:00', end: '18:00' }] },
      },
      advanceBooking: { min: 24, max: 60 },
    },
    requirements: ['Kitchen access', 'Minimum 10 people'],
    features: ['Traditional recipes', 'Fresh ingredients', 'Setup included'],
    gallery: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop'],
    rating: 4.9,
    reviewCount: 89,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    businessId: 'business-3',
    name: 'Custom Tailoring & Alterations',
    description: 'Professional tailoring services for traditional and modern clothing',
    category: 'Fashion',
    subcategory: 'Tailoring',
    price: {
      amount: 200,
      currency: 'NAD',
      type: 'fixed',
    },
    duration: {
      amount: 3,
      unit: 'days',
    },
    location: {
      type: 'business',
      address: 'Katutura, Windhoek',
    },
    availability: {
      schedule: {
        monday: { isAvailable: true, slots: [{ start: '08:00', end: '17:00' }] },
        tuesday: { isAvailable: true, slots: [{ start: '08:00', end: '17:00' }] },
        wednesday: { isAvailable: true, slots: [{ start: '08:00', end: '17:00' }] },
        thursday: { isAvailable: true, slots: [{ start: '08:00', end: '17:00' }] },
        friday: { isAvailable: true, slots: [{ start: '08:00', end: '17:00' }] },
        saturday: { isAvailable: true, slots: [{ start: '09:00', end: '15:00' }] },
        sunday: { isAvailable: false, slots: [] },
      },
      advanceBooking: { min: 48, max: 90 },
    },
    requirements: ['Fabric provided by customer', 'Measurements required'],
    features: ['Custom fitting', 'Traditional designs', 'Modern styles'],
    gallery: ['https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop'],
    rating: 4.7,
    reviewCount: 156,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    type: 'mobile_money',
    provider: 'mtn_mobile_money',
    details: {
      phoneNumber: '*****1234',
    },
  },
  {
    type: 'credit_card',
    provider: 'visa',
    details: {
      cardNumber: '****1234',
      expiryMonth: 12,
      expiryYear: 2025,
      holderName: 'John Doe',
    },
  },
];

class BookingService {
  /**
   * Get all services with optional filters
   */
  async getServices(filters?: {
    category?: string;
    location?: { latitude: number; longitude: number; radius?: number };
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ services: Service[]; total: number }> {
    try {
      const response = await apiService.get<{ services: Service[]; total: number }>(
        '/services',
        false
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch services');
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      
      // Return mock data as fallback
      let filteredServices = [...MOCK_SERVICES];
      
      if (filters?.category) {
        filteredServices = filteredServices.filter(service => 
          service.category.toLowerCase() === filters.category?.toLowerCase()
        );
      }
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredServices = filteredServices.filter(service =>
          service.name.toLowerCase().includes(searchTerm) ||
          service.description.toLowerCase().includes(searchTerm) ||
          service.category.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters?.rating) {
        filteredServices = filteredServices.filter(service =>
          (service.rating || 0) >= filters.rating!
        );
      }
      
      return {
        services: filteredServices,
        total: filteredServices.length,
      };
    }
  }

  /**
   * Get service details by ID
   */
  async getService(serviceId: string): Promise<Service> {
    try {
      const response = await apiService.get<Service>(`/services/${serviceId}`, false);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Service not found');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to fetch service details');
    }
  }

  /**
   * Check service availability
   */
  async checkAvailability(query: AvailabilityQuery): Promise<{
    available: boolean;
    slots: { date: string; slots: TimeSlot[] }[];
  }> {
    try {
      const response = await apiService.post<{
        available: boolean;
        slots: { date: string; slots: TimeSlot[] }[];
      }>('/bookings/check-availability', query, false);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to check availability');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to check availability');
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: BookingRequest): Promise<Booking> {
    try {
      const response = await apiService.post<Booking>('/bookings', bookingData);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create booking');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to create booking');
    }
  }

  /**
   * Get user's bookings
   */
  async getBookings(filters?: BookingFilters): Promise<{
    bookings: Booking[];
    total: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v.toString()));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const endpoint = `/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<{
        bookings: Booking[];
        total: number;
      }>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch bookings');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to fetch bookings');
    }
  }

  /**
   * Get booking details by ID
   */
  async getBooking(bookingId: string): Promise<Booking> {
    try {
      const response = await apiService.get<Booking>(`/bookings/${bookingId}`);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Booking not found');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to fetch booking details');
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    notes?: string
  ): Promise<Booking> {
    try {
      const response = await apiService.patch<Booking>(`/bookings/${bookingId}/status`, {
        status,
        notes,
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update booking status');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to update booking status');
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    try {
      const response = await apiService.patch<Booking>(`/bookings/${bookingId}/cancel`, {
        reason,
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to cancel booking');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to cancel booking');
    }
  }

  /**
   * Process payment for booking
   */
  async processPayment(
    bookingId: string,
    paymentMethod: PaymentMethod
  ): Promise<PaymentInfo> {
    try {
      const response = await apiService.post<PaymentInfo>(
        `/bookings/${bookingId}/payment`,
        { paymentMethod }
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Payment processing failed');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Payment processing failed');
    }
  }

  /**
   * Request refund
   */
  async requestRefund(bookingId: string, reason: string): Promise<{
    refundId: string;
    status: string;
    amount: number;
    estimatedProcessingTime: string;
  }> {
    try {
      const response = await apiService.post<{
        refundId: string;
        status: string;
        amount: number;
        estimatedProcessingTime: string;
      }>(`/bookings/${bookingId}/refund`, { reason });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Refund request failed');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Refund request failed');
    }
  }

  /**
   * Submit review for completed booking
   */
  async submitReview(
    bookingId: string,
    rating: number,
    comment?: string,
    images?: string[]
  ): Promise<Review> {
    try {
      const response = await apiService.post<Review>(`/bookings/${bookingId}/review`, {
        rating,
        comment,
        images,
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to submit review');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to submit review');
    }
  }

  /**
   * Get reviews for a service
   */
  async getServiceReviews(
    serviceId: string,
    page = 1,
    limit = 10
  ): Promise<{
    reviews: Review[];
    total: number;
    averageRating: number;
  }> {
    try {
      const response = await apiService.get<{
        reviews: Review[];
        total: number;
        averageRating: number;
      }>(`/services/${serviceId}/reviews?page=${page}&limit=${limit}`, false);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch reviews');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to fetch reviews');
    }
  }

  /**
   * Get saved payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiService.get<PaymentMethod[]>('/payment-methods');

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch payment methods');
    } catch (error) {
      console.warn('API not available, using mock payment methods:', error);
      return MOCK_PAYMENT_METHODS;
    }
  }

  /**
   * Save payment method
   */
  async savePaymentMethod(paymentMethod: Omit<PaymentMethod, 'token'>): Promise<PaymentMethod> {
    try {
      const response = await apiService.post<PaymentMethod>('/payment-methods', paymentMethod);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to save payment method');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to save payment method');
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodToken: string): Promise<void> {
    try {
      const response = await apiService.delete(`/payment-methods/${paymentMethodToken}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete payment method');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to delete payment method');
    }
  }
}

// Export singleton instance
export const bookingService = new BookingService();
export default bookingService; 