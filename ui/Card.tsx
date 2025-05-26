import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
}

export function CardTitle({ children, style }: CardTitleProps) {
  return (
    <Text style={[styles.title, style]}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, style }: CardDescriptionProps) {
  return (
    <Text style={[styles.description, style]}>
      {children}
    </Text>
  );
}

export function CardContent({ children, style }: CardContentProps) {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style }: CardFooterProps) {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
  },
  content: {
    padding: 24,
  },
  footer: {
    padding: 24,
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 