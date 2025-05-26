import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  messageType: 'text' | 'image' | 'booking' | 'system';
  isRead: boolean;
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  }[];
}

interface Provider {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  isVerified: boolean;
  responseTime: string;
}

export default function ChatScreen() {
  const { providerId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const scrollViewRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const currentUserId = 'user-123'; // This would come from auth context

  useEffect(() => {
    loadChatData();
    animateEntrance();
    // Simulate typing indicators and real-time updates
    const typingInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    }, 10000);

    return () => clearInterval(typingInterval);
  }, [providerId]);

  const animateEntrance = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const loadChatData = () => {
    // Mock provider data
    const mockProvider: Provider = {
      id: providerId as string,
      name: 'Amara Nakamura',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b8b8a0a7?w=200&h=200&fit=crop',
      isOnline: true,
      lastSeen: new Date(),
      isVerified: true,
      responseTime: '2 mins',
    };

    // Mock messages
    const mockMessages: Message[] = [
      {
        id: '1',
        text: 'Hello! Thank you for your interest in my hair braiding services. How can I help you today?',
        timestamp: new Date(Date.now() - 60000 * 30),
        senderId: providerId as string,
        messageType: 'text',
        isRead: true,
      },
      {
        id: '2',
        text: 'Hi! I saw your hair braiding service and I\'m interested in booking an appointment. Could you tell me more about your availability?',
        timestamp: new Date(Date.now() - 60000 * 25),
        senderId: currentUserId,
        messageType: 'text',
        isRead: true,
      },
      {
        id: '3',
        text: 'Of course! I have availability this week on Wednesday, Friday, and Saturday. What type of braiding are you looking for?',
        timestamp: new Date(Date.now() - 60000 * 20),
        senderId: providerId as string,
        messageType: 'text',
        isRead: true,
      },
      {
        id: '4',
        text: 'I\'m interested in box braids. How long does it usually take?',
        timestamp: new Date(Date.now() - 60000 * 15),
        senderId: currentUserId,
        messageType: 'text',
        isRead: true,
      },
      {
        id: '5',
        text: 'Box braids typically take 3-4 hours depending on the length and thickness you want. I use premium synthetic hair that looks very natural. The price is N$120 and includes hair care consultation.',
        timestamp: new Date(Date.now() - 60000 * 10),
        senderId: providerId as string,
        messageType: 'text',
        isRead: true,
      },
      {
        id: '6',
        text: 'That sounds perfect! What time slots do you have available on Friday?',
        timestamp: new Date(Date.now() - 60000 * 5),
        senderId: currentUserId,
        messageType: 'text',
        isRead: false,
      },
    ];

    setProvider(mockProvider);
    setMessages(mockMessages);
  };

  const sendMessage = () => {
    if (newMessage.trim().length === 0) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      timestamp: new Date(),
      senderId: currentUserId,
      messageType: 'text',
      isRead: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate provider response
    setTimeout(() => {
      const responses = [
        'Thanks for your message! Let me check my schedule.',
        'I have slots available at 9 AM, 1 PM, and 4 PM on Friday.',
        'Would any of those times work for you?',
        'I can also offer you a 10% discount for being a new customer!',
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        senderId: providerId as string,
        messageType: 'text',
        isRead: false,
      };

      setMessages(prev => [...prev, response]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours < 1) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === currentUserId;
    const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].senderId !== item.senderId);
    const showTimestamp = index === messages.length - 1 || 
      messages[index + 1].senderId !== item.senderId ||
      (new Date(messages[index + 1].timestamp).getTime() - item.timestamp.getTime()) > 300000; // 5 minutes

    return (
      <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
        {showAvatar && !isOwnMessage && (
          <Image source={{ uri: provider?.avatar }} style={styles.messageAvatar} />
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          !showAvatar && !isOwnMessage && styles.messageWithoutAvatar,
        ]}>
          {isOwnMessage ? (
            <LinearGradient
              colors={['#FF6B35', '#FF8E53']}
              style={styles.messageBubbleGradient}
            >
              <Text style={styles.ownMessageText}>{item.text}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.otherMessageContent}>
              <Text style={styles.otherMessageText}>{item.text}</Text>
            </View>
          )}
        </View>

        {showTimestamp && (
          <View style={[styles.timestampContainer, isOwnMessage && styles.ownTimestampContainer]}>
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
            {isOwnMessage && (
              <MaterialCommunityIcons 
                name={item.isRead ? "check-all" : "check"} 
                size={14} 
                color={item.isRead ? "#4CAF50" : "#9CA3AF"} 
              />
            )}
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <Image source={{ uri: provider?.avatar }} style={styles.typingAvatar} />
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
            <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
            <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
          </View>
        </View>
      </View>
    );
  };

  if (!provider) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={40} color="#FF6B35" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.providerInfo} onPress={() => router.push(`/service/${providerId}`)}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: provider.avatar }} style={styles.providerAvatar} />
            {provider.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.providerDetails}>
            <View style={styles.providerNameRow}>
              <Text style={styles.providerName}>{provider.name}</Text>
              {provider.isVerified && (
                <MaterialCommunityIcons name="check-decagram" size={16} color="#4CAF50" />
              )}
            </View>
            <Text style={styles.providerStatus}>
              {provider.isOnline ? 'Online' : `Last seen ${formatTime(provider.lastSeen)}`}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.callButton}>
          <MaterialCommunityIcons name="phone" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <Animated.View style={[styles.messagesContainer, { opacity: fadeAnim }]}>
        <FlatList
          ref={scrollViewRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        />
        {renderTypingIndicator()}
      </Animated.View>

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton}>
            <MaterialCommunityIcons name="paperclip" size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, newMessage.trim().length > 0 && styles.sendButtonActive]}
            onPress={sendMessage}
            disabled={newMessage.trim().length === 0}
          >
            {newMessage.trim().length > 0 ? (
              <LinearGradient
                colors={['#FF6B35', '#FF8E53']}
                style={styles.sendButtonGradient}
              >
                <MaterialCommunityIcons name="send" size={20} color="#FFF" />
              </LinearGradient>
            ) : (
              <MaterialCommunityIcons name="microphone" size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  providerDetails: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 6,
  },
  providerStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  ownMessageBubble: {
    alignSelf: 'flex-end',
  },
  otherMessageBubble: {
    alignSelf: 'flex-start',
  },
  messageWithoutAvatar: {
    marginLeft: 40,
  },
  messageBubbleGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  otherMessageContent: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMessageText: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
  },
  otherMessageText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 40,
  },
  ownTimestampContainer: {
    justifyContent: 'flex-end',
    marginLeft: 0,
    marginRight: 0,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  typingBubble: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sendButtonActive: {
    backgroundColor: 'transparent',
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 