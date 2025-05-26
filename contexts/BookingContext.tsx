import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  bookingService, 
  Service, 
  Booking, 
  BookingRequest, 
  BookingStatus, 
  BookingFilters,
  PaymentMethod,
  Review
} from '../services/bookingService';

interface BookingContextType {
  // Services
  services: Service[];
  featuredServices: Service[];
  isLoadingServices: boolean;
  
  // Bookings
  bookings: Booking[];
  isLoadingBookings: boolean;
  
  // Current booking flow
  selectedService: Service | null;
  currentBooking: Booking | null;
  
  // Payment methods
  paymentMethods: PaymentMethod[];
  
  // Error handling
  error: string | null;
  
  // Service operations
  loadServices: (filters?: any) => Promise<void>;
  loadFeaturedServices: () => Promise<void>;
  getService: (serviceId: string) => Promise<Service>;
  searchServices: (query: string, filters?: any) => Promise<Service[]>;
  
  // Booking operations
  loadBookings: (filters?: BookingFilters) => Promise<void>;
  createBooking: (bookingData: BookingRequest) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, status: BookingStatus, notes?: string) => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;
  
  // Payment operations
  loadPaymentMethods: () => Promise<void>;
  processPayment: (bookingId: string, paymentMethod: PaymentMethod) => Promise<void>;
  
  // Review operations
  submitReview: (bookingId: string, rating: number, comment?: string, images?: string[]) => Promise<void>;
  
  // State management
  setSelectedService: (service: Service | null) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial data
    loadFeaturedServices();
    loadPaymentMethods();
  }, []);

  const loadServices = async (filters?: any) => {
    try {
      setIsLoadingServices(true);
      setError(null);
      
      const result = await bookingService.getServices(filters);
      setServices(result.services);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
      setError(errorMessage);
      console.error('Error loading services:', error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const loadFeaturedServices = async () => {
    try {
      setError(null);
      
      // Load featured services (top rated, popular, etc.)
      const result = await bookingService.getServices({
        rating: 4.5,
        limit: 10
      });
      setFeaturedServices(result.services);
    } catch (error) {
      console.error('Error loading featured services:', error);
    }
  };

  const getService = async (serviceId: string): Promise<Service> => {
    try {
      setError(null);
      return await bookingService.getService(serviceId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load service';
      setError(errorMessage);
      throw error;
    }
  };

  const searchServices = async (query: string, filters?: any): Promise<Service[]> => {
    try {
      setError(null);
      
      const result = await bookingService.getServices({
        search: query,
        ...filters
      });
      return result.services;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      throw error;
    }
  };

  const loadBookings = async (filters?: BookingFilters) => {
    try {
      setIsLoadingBookings(true);
      setError(null);
      
      const result = await bookingService.getBookings(filters);
      setBookings(result.bookings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bookings';
      setError(errorMessage);
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const createBooking = async (bookingData: BookingRequest): Promise<Booking> => {
    try {
      setError(null);
      
      const booking = await bookingService.createBooking(bookingData);
      setCurrentBooking(booking);
      
      // Refresh bookings list
      await loadBookings();
      
      return booking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      setError(errorMessage);
      throw error;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus, notes?: string) => {
    try {
      setError(null);
      
      const updatedBooking = await bookingService.updateBookingStatus(bookingId, status, notes);
      
      // Update bookings list
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      
      // Update current booking if it's the same one
      if (currentBooking?.id === bookingId) {
        setCurrentBooking(updatedBooking);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking';
      setError(errorMessage);
      throw error;
    }
  };

  const cancelBooking = async (bookingId: string, reason?: string) => {
    try {
      setError(null);
      
      const cancelledBooking = await bookingService.cancelBooking(bookingId, reason);
      
      // Update bookings list
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? cancelledBooking : booking
      ));
      
      // Update current booking if it's the same one
      if (currentBooking?.id === bookingId) {
        setCurrentBooking(cancelledBooking);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
      setError(errorMessage);
      throw error;
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setError(null);
      const methods = await bookingService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const processPayment = async (bookingId: string, paymentMethod: PaymentMethod) => {
    try {
      setError(null);
      
      await bookingService.processPayment(bookingId, paymentMethod);
      
      // Refresh booking to get updated payment status
      const updatedBooking = await bookingService.getBooking(bookingId);
      
      // Update bookings list
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      
      // Update current booking if it's the same one
      if (currentBooking?.id === bookingId) {
        setCurrentBooking(updatedBooking);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setError(errorMessage);
      throw error;
    }
  };

  const submitReview = async (bookingId: string, rating: number, comment?: string, images?: string[]) => {
    try {
      setError(null);
      
      await bookingService.submitReview(bookingId, rating, comment, images);
      
      // Refresh bookings to show review status
      await loadBookings();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review';
      setError(errorMessage);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshData = async () => {
    try {
      await Promise.all([
        loadFeaturedServices(),
        loadBookings(),
        loadPaymentMethods()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const value: BookingContextType = {
    // Services
    services,
    featuredServices,
    isLoadingServices,
    
    // Bookings
    bookings,
    isLoadingBookings,
    
    // Current booking flow
    selectedService,
    currentBooking,
    
    // Payment methods
    paymentMethods,
    
    // Error handling
    error,
    
    // Service operations
    loadServices,
    loadFeaturedServices,
    getService,
    searchServices,
    
    // Booking operations
    loadBookings,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    
    // Payment operations
    loadPaymentMethods,
    processPayment,
    
    // Review operations
    submitReview,
    
    // State management
    setSelectedService,
    setCurrentBooking,
    clearError,
    refreshData,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
} 