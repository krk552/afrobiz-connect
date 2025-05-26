import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ImageStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children?: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disabled?: boolean;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

interface CardImageProps {
  source: { uri: string } | number;
  height?: number;
  style?: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardActionsProps {
  children: React.ReactNode;
  style?: ViewStyle;
  alignment?: 'left' | 'center' | 'right' | 'space-between';
}

// Main Card Component
const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Image: React.FC<CardImageProps>;
  Content: React.FC<CardContentProps>;
  Actions: React.FC<CardActionsProps>;
} = ({
  children,
  variant = 'default',
  onPress,
  style,
  contentStyle,
  disabled = false,
}) => {
  const cardStyle = [
    styles.card,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const content = (
    <View style={[styles.cardContent, contentStyle]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{content}</View>;
};

// Card Header Component
const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  avatar,
  icon,
  action,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerLeft}>
        {avatar && (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        )}
        {icon && !avatar && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color="#6B7280" />
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {action && <View style={styles.headerAction}>{action}</View>}
    </View>
  );
};

// Card Image Component
const CardImage: React.FC<CardImageProps> = ({
  source,
  height = 200,
  style,
  resizeMode = 'cover',
}) => {
  return (
    <Image
      source={source}
      style={[styles.image, { height }, style]}
      resizeMode={resizeMode}
    />
  );
};

// Card Content Component
const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  return <View style={[styles.content, style]}>{children}</View>;
};

// Card Actions Component
const CardActions: React.FC<CardActionsProps> = ({
  children,
  style,
  alignment = 'right',
}) => {
  const getJustifyContent = (): 'flex-start' | 'center' | 'flex-end' | 'space-between' => {
    switch (alignment) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'space-between':
        return 'space-between';
      default:
        return 'flex-end';
    }
  };

  return (
    <View style={[styles.actions, { justifyContent: getJustifyContent() }, style]}>
      {children}
    </View>
  );
};

// Attach sub-components to main Card component
Card.Header = CardHeader;
Card.Image = CardImage;
Card.Content = CardContent;
Card.Actions = CardActions;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },

  // Variants
  default: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  filled: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // States
  disabled: {
    opacity: 0.6,
  },

  cardContent: {
    flex: 1,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  headerText: {
    flex: 1,
  },

  headerAction: {
    marginLeft: 12,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Image styles
  image: {
    width: '100%',
  },

  // Content styles
  content: {
    padding: 16,
  },

  // Actions styles
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default Card; 