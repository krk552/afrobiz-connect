import apiService, { ApiResponse, ApiError } from './api';

// Types
export interface ChatRoom {
  id: string;
  type: 'direct' | 'group' | 'support';
  name?: string;
  description?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  bookingId?: string; // For booking-related chats
  businessId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'customer' | 'business' | 'support';
  isOnline: boolean;
  lastSeen?: string;
  joinedAt: string;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  type: MessageType;
  content: string;
  attachments?: Attachment[];
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  metadata?: {
    [key: string]: any;
  };
  isEdited: boolean;
  editedAt?: string;
  isDelivered: boolean;
  isRead: boolean;
  readBy?: {
    userId: string;
    readAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location',
  SYSTEM = 'system',
  BOOKING_UPDATE = 'booking_update',
  PAYMENT_UPDATE = 'payment_update',
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  name: string;
  url: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
  duration?: number; // for audio/video files
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface SendMessageRequest {
  chatRoomId: string;
  type: MessageType;
  content: string;
  attachments?: File[];
  replyToMessageId?: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface CreateChatRequest {
  type: 'direct' | 'group';
  participantIds: string[];
  name?: string;
  description?: string;
  bookingId?: string;
}

export interface ChatFilters {
  type?: 'direct' | 'group' | 'support';
  isArchived?: boolean;
  hasUnread?: boolean;
  bookingId?: string;
  businessId?: string;
}

export interface MessageFilters {
  type?: MessageType;
  senderId?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean;
  search?: string;
}

// WebSocket events
export enum ChatEvent {
  MESSAGE_SENT = 'message_sent',
  MESSAGE_DELIVERED = 'message_delivered',
  MESSAGE_READ = 'message_read',
  MESSAGE_EDITED = 'message_edited',
  MESSAGE_DELETED = 'message_deleted',
  USER_TYPING = 'user_typing',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  CHAT_CREATED = 'chat_created',
  CHAT_UPDATED = 'chat_updated',
  PARTICIPANT_JOINED = 'participant_joined',
  PARTICIPANT_LEFT = 'participant_left',
}

export interface ChatEventData {
  event: ChatEvent;
  data: any;
  timestamp: string;
}

// Add mock data after interfaces
const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: '1',
    type: 'direct',
    name: 'Hair Stylist Chat',
    participants: [
      {
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        isOnline: true,
        joinedAt: new Date().toISOString(),
      },
      {
        userId: 'business-1',
        firstName: 'Sarah',
        lastName: 'Beauty',
        role: 'business',
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        joinedAt: new Date().toISOString(),
      },
    ],
    lastMessage: {
      id: 'msg-1',
      chatRoomId: '1',
      senderId: 'business-1',
      type: MessageType.TEXT,
      content: 'Thank you for booking! I\'ll see you tomorrow at 2 PM.',
      isEdited: false,
      isDelivered: true,
      isRead: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    unreadCount: 1,
    isArchived: false,
    isMuted: false,
    bookingId: 'booking-1',
    businessId: 'business-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class ChatService {
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private eventListeners: Map<ChatEvent, Function[]> = new Map();
  private isWebSocketEnabled = false; // Temporarily disable WebSocket

  /**
   * Initialize WebSocket connection
   */
  async initializeWebSocket(): Promise<void> {
    if (!this.isWebSocketEnabled) {
      console.log('WebSocket disabled for development');
      return;
    }

    try {
      const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'wss://api.afrobizconnect.com/ws';
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = this.handleWebSocketOpen.bind(this);
      this.wsConnection.onmessage = this.handleWebSocketMessage.bind(this);
      this.wsConnection.onclose = this.handleWebSocketClose.bind(this);
      this.wsConnection.onerror = this.handleWebSocketError.bind(this);
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Close WebSocket connection
   */
  closeWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * Add event listener
   */
  addEventListener(event: ChatEvent, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: ChatEvent, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Get chat rooms
   */
  async getChatRooms(filters?: ChatFilters): Promise<{
    chatRooms: ChatRoom[];
    total: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/chat/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<{
        chatRooms: ChatRoom[];
        total: number;
      }>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch chat rooms');
    } catch (error) {
      console.warn('API not available, using mock chat rooms:', error);
      return {
        chatRooms: MOCK_CHAT_ROOMS,
        total: MOCK_CHAT_ROOMS.length,
      };
    }
  }

  /**
   * Get chat room details
   */
  async getChatRoom(chatRoomId: string): Promise<ChatRoom> {
    try {
      const response = await apiService.get<ChatRoom>(`/chat/rooms/${chatRoomId}`);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Chat room not found');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to fetch chat room');
    }
  }

  /**
   * Create new chat room
   */
  async createChatRoom(request: CreateChatRequest): Promise<ChatRoom> {
    try {
      const response = await apiService.post<ChatRoom>('/chat/rooms', request);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create chat room');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to create chat room');
    }
  }

  /**
   * Get messages for a chat room
   */
  async getMessages(
    chatRoomId: string,
    page = 1,
    limit = 50,
    filters?: MessageFilters
  ): Promise<{
    messages: Message[];
    total: number;
  }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/chat/rooms/${chatRoomId}/messages?${queryParams.toString()}`;
      const response = await apiService.get<{
        messages: Message[];
        total: number;
      }>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch messages');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to fetch messages');
    }
  }

  /**
   * Send message
   */
  async sendMessage(request: SendMessageRequest): Promise<Message> {
    try {
      let response: ApiResponse<Message>;

      if (request.attachments && request.attachments.length > 0) {
        // Upload attachments first
        const formData = new FormData();
        formData.append('chatRoomId', request.chatRoomId);
        formData.append('type', request.type);
        formData.append('content', request.content);
        
        if (request.replyToMessageId) {
          formData.append('replyToMessageId', request.replyToMessageId);
        }
        
        if (request.metadata) {
          formData.append('metadata', JSON.stringify(request.metadata));
        }

        request.attachments.forEach((file, index) => {
          formData.append(`attachments`, file);
        });

        response = await apiService.upload<Message>('/chat/messages/with-attachments', formData);
      } else {
        // Send text message
        const { attachments, ...messageData } = request;
        response = await apiService.post<Message>('/chat/messages', messageData);
      }

      if (response.success && response.data) {
        // Send via WebSocket for real-time delivery
        this.sendWebSocketMessage({
          event: ChatEvent.MESSAGE_SENT,
          data: response.data,
          timestamp: new Date().toISOString(),
        });

        return response.data;
      }

      throw new Error(response.message || 'Failed to send message');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to send message');
    }
  }

  /**
   * Edit message
   */
  async editMessage(messageId: string, content: string): Promise<Message> {
    try {
      const response = await apiService.patch<Message>(`/chat/messages/${messageId}`, {
        content,
      });

      if (response.success && response.data) {
        // Send via WebSocket for real-time updates
        this.sendWebSocketMessage({
          event: ChatEvent.MESSAGE_EDITED,
          data: response.data,
          timestamp: new Date().toISOString(),
        });

        return response.data;
      }

      throw new Error(response.message || 'Failed to edit message');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to edit message');
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/chat/messages/${messageId}`);

      if (response.success) {
        // Send via WebSocket for real-time updates
        this.sendWebSocketMessage({
          event: ChatEvent.MESSAGE_DELETED,
          data: { messageId },
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error(response.message || 'Failed to delete message');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to delete message');
    }
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const response = await apiService.post(`/chat/messages/${messageId}/read`);

      if (response.success) {
        // Send via WebSocket for real-time updates
        this.sendWebSocketMessage({
          event: ChatEvent.MESSAGE_READ,
          data: { messageId },
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error(response.message || 'Failed to mark message as read');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to mark message as read');
    }
  }

  /**
   * Mark all messages in chat room as read
   */
  async markChatAsRead(chatRoomId: string): Promise<void> {
    try {
      const response = await apiService.post(`/chat/rooms/${chatRoomId}/read`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to mark chat as read');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to mark chat as read');
    }
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(chatRoomId: string, isTyping: boolean): void {
    this.sendWebSocketMessage({
      event: ChatEvent.USER_TYPING,
      data: { chatRoomId, isTyping },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Archive chat room
   */
  async archiveChatRoom(chatRoomId: string): Promise<void> {
    try {
      const response = await apiService.patch(`/chat/rooms/${chatRoomId}/archive`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to archive chat');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to archive chat');
    }
  }

  /**
   * Unarchive chat room
   */
  async unarchiveChatRoom(chatRoomId: string): Promise<void> {
    try {
      const response = await apiService.patch(`/chat/rooms/${chatRoomId}/unarchive`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to unarchive chat');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to unarchive chat');
    }
  }

  /**
   * Mute chat room
   */
  async muteChatRoom(chatRoomId: string): Promise<void> {
    try {
      const response = await apiService.patch(`/chat/rooms/${chatRoomId}/mute`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to mute chat');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to mute chat');
    }
  }

  /**
   * Unmute chat room
   */
  async unmuteChatRoom(chatRoomId: string): Promise<void> {
    try {
      const response = await apiService.patch(`/chat/rooms/${chatRoomId}/unmute`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to unmute chat');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to unmute chat');
    }
  }

  /**
   * Search messages across all chats
   */
  async searchMessages(
    query: string,
    filters?: {
      chatRoomId?: string;
      senderId?: string;
      type?: MessageType;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{
    messages: Message[];
    total: number;
  }> {
    try {
      const queryParams = new URLSearchParams({ query });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/chat/messages/search?${queryParams.toString()}`;
      const response = await apiService.get<{
        messages: Message[];
        total: number;
      }>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to search messages');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to search messages');
    }
  }

  // Private WebSocket methods
  private handleWebSocketOpen(): void {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;

    // Send authentication message
    this.sendWebSocketMessage({
      event: ChatEvent.USER_ONLINE,
      data: {},
      timestamp: new Date().toISOString(),
    });
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const eventData: ChatEventData = JSON.parse(event.data);
      this.dispatchEvent(eventData.event, eventData.data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleWebSocketClose(): void {
    console.log('WebSocket disconnected');
    this.attemptReconnect();
  }

  private handleWebSocketError(error: Event): void {
    console.error('WebSocket error:', error);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, this.reconnectDelay);

      // Exponential backoff
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private sendWebSocketMessage(data: ChatEventData): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(data));
    }
  }

  private dispatchEvent(event: ChatEvent, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService; 