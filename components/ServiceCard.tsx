import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Service } from '../services/bookingService';
import Card from './ui/Card';
import Button from './ui/Button';

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
  onBookPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  style?: ViewStyle;
  variant?: 'default' | 'compact' | 'featured';
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onPress,
  onBookPress,
  onFavoritePress,
  isFavorite = false,
  style,
  variant = 'default',
}) => {
  const renderRating = () => {
    const stars = [];
    const fullStars = Math.floor(service.rating);
    const hasHalfStar = service.rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color="#F59E0B" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#F59E0B" />
      );
    }

    const emptyStars = 5 - Math.ceil(service.rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#D1D5DB" />
      );
    }

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.stars}>{stars}</View>
        <Text style={styles.ratingText}>
          {service.rating.toFixed(1)} ({service.reviewCount})
        </Text>
      </View>
    );
  };

  const renderPrice = () => {
    if (service.pricing.type === 'fixed') {
      return (
        <Text style={styles.price}>
          ${service.pricing.amount}
        </Text>
      );
    } else if (service.pricing.type === 'hourly') {
      return (
        <Text style={styles.price}>
          ${service.pricing.amount}/hr
        </Text>
      );
    } else {
      return (
        <Text style={styles.price}>
          ${service.pricing.min} - ${service.pricing.max}
        </Text>
      );
    }
  };

  const renderBadges = () => {
    const badges = [];
    
    if (service.isVerified) {
      badges.push(
        <View key="verified" style={[styles.badge, styles.verifiedBadge]}>
          <Ionicons name="checkmark-circle" size={12} color="#10B981" />
          <Text style={styles.verifiedBadgeText}>Verified</Text>
        </View>
      );
    }

    if (service.isTopRated) {
      badges.push(
        <View key="top-rated" style={[styles.badge, styles.topRatedBadge]}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.topRatedBadgeText}>Top Rated</Text>
        </View>
      );
    }

    if (service.isOnline) {
      badges.push(
        <View key="online" style={[styles.badge, styles.onlineBadge]}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineBadgeText}>Online</Text>
        </View>
      );
    }

    return badges.length > 0 ? (
      <View style={styles.badgesContainer}>{badges}</View>
    ) : null;
  };

  const renderCompactCard = () => (
    <TouchableOpacity style={[styles.compactCard, style]} onPress={onPress}>
      <Image source={{ uri: service.images[0] }} style={styles.compactImage} />
      <View style={styles.compactContent}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {service.title}
          </Text>
          {onFavoritePress && (
            <TouchableOpacity onPress={onFavoritePress} style={styles.favoriteButton}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : '#6B7280'}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.compactProvider} numberOfLines={1}>
          {service.provider.businessName}
        </Text>
        {renderRating()}
        <View style={styles.compactFooter}>
          {renderPrice()}
          <Text style={styles.compactLocation} numberOfLines={1}>
            {service.location.city}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedCard = () => (
    <Card variant="elevated" style={[styles.featuredCard, style]} onPress={onPress}>
      <View style={styles.featuredImageContainer}>
        <Card.Image source={{ uri: service.images[0] }} height={180} />
        {renderBadges()}
        {onFavoritePress && (
          <TouchableOpacity
            onPress={onFavoritePress}
            style={styles.featuredFavoriteButton}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <Card.Content>
        <View style={styles.featuredHeader}>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {service.title}
          </Text>
          {renderPrice()}
        </View>
        
        <Text style={styles.featuredProvider} numberOfLines={1}>
          {service.provider.businessName}
        </Text>
        
        <Text style={styles.featuredDescription} numberOfLines={2}>
          {service.description}
        </Text>
        
        {renderRating()}
        
        <View style={styles.featuredLocation}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.featuredLocationText}>
            {service.location.city}, {service.location.country}
          </Text>
        </View>
      </Card.Content>
      
      {onBookPress && (
        <Card.Actions>
          <Button
            title="Book Now"
            onPress={onBookPress}
            size="small"
            icon="calendar-outline"
          />
        </Card.Actions>
      )}
    </Card>
  );

  const renderDefaultCard = () => (
    <Card variant="elevated" style={style} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Card.Image source={{ uri: service.images[0] }} height={160} />
        {renderBadges()}
        {onFavoritePress && (
          <TouchableOpacity
            onPress={onFavoritePress}
            style={styles.favoriteButtonOverlay}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {service.title}
          </Text>
          {renderPrice()}
        </View>
        
        <Text style={styles.provider} numberOfLines={1}>
          {service.provider.businessName}
        </Text>
        
        {renderRating()}
        
        <View style={styles.location}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.locationText}>
            {service.location.city}
          </Text>
        </View>
      </Card.Content>
      
      {onBookPress && (
        <Card.Actions>
          <Button
            title="Book"
            onPress={onBookPress}
            size="small"
            variant="outline"
          />
        </Card.Actions>
      )}
    </Card>
  );

  switch (variant) {
    case 'compact':
      return renderCompactCard();
    case 'featured':
      return renderFeaturedCard();
    default:
      return renderDefaultCard();
  }
};

const styles = StyleSheet.create({
  // Compact variant styles
  compactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  compactContent: {
    flex: 1,
    padding: 12,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  compactProvider: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  compactLocation: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Featured variant styles
  featuredCard: {
    marginBottom: 20,
  },
  featuredImageContainer: {
    position: 'relative',
  },
  featuredFavoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  featuredProvider: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  featuredLocationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },

  // Default variant styles
  imageContainer: {
    position: 'relative',
  },
  favoriteButtonOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  provider: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },

  // Common styles
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
  },
  
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Badges
  badgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 2,
  },
  topRatedBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  topRatedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 2,
  },
  onlineBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  onlineBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#22C55E',
    marginLeft: 4,
  },

  favoriteButton: {
    padding: 4,
  },
});

export default ServiceCard; 