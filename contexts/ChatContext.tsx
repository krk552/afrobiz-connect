import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  chatService, 
  ChatRoom, 
  Message, 
  SendMessageRequest, 
  CreateChatRequest,
  ChatEvent,
  MessageType,
  ChatFilters,
  MessageFilters
} from '../services/chatService';

interface ChatContextType {
  // Chat rooms
  chatRooms: ChatRoom[];
  isLoadingChats: boolean;
  
  // Current chat
  currentChatRoom: ChatRoom | null;
  messages: Message[];
  isLoadingMessages: boolean;
  
  // Real-time status
  isConnected: boolean;
  typingUsers: string[];
  
  // Error handling
  error: string | null;
  
  // Chat operations
  loadChatRooms: (filters?: ChatFilters) => Promise<void>;
  createChatRoom: (request: CreateChatRequest) => Promise<ChatRoom>;
  selectChatRoom: (chatRoom: ChatRoom) => Promise<void>;
  
  // Message operations
  loadMessages: (chatRoomId: string, page?: number, filters?: MessageFilters) => Promise<void>;
  sendMessage: (request: SendMessageRequest) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markChatAsRead: (chatRoomId: string) => Promise<void>;
  
  // Real-time operations
  sendTypingIndicator: (chatRoomId: string, isTyping: boolean) => void;
  
  // Chat management
  archiveChat: (chatRoomId: string) => Promise<void>;
  unarchiveChat: (chatRoomId: string) => Promise<void>;
  muteChat: (chatRoomId: string) => Promise<void>;
  unmuteChat: (chatRoomId: string) => Promise<void>;
  
  // Search
  searchMessages: (query: string, filters?: any) => Promise<Message[]>;
  
  // State management
  clearError: () => void;
  refreshData: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  
  const [currentChatRoom, setCurrentChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    initializeChat();
    
    return () => {
      // Cleanup WebSocket connection
      chatService.closeWebSocket();
    };
  }, []);

  const initializeChat = async () => {
    try {
      // Initialize WebSocket connection
      await chatService.initializeWebSocket();
      
      // Set up event listeners
      setupEventListeners();
      
      // Load initial chat rooms
      await loadChatRooms();
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Failed to initialize chat');
    }
  };

  const setupEventListeners = () => {
    // Message events
    chatService.addEventListener(ChatEvent.MESSAGE_SENT, handleNewMessage);
    chatService.addEventListener(ChatEvent.MESSAGE_EDITED, handleMessageEdited);
    chatService.addEventListener(ChatEvent.MESSAGE_DELETED, handleMessageDeleted);
    chatService.addEventListener(ChatEvent.MESSAGE_READ, handleMessageRead);
    
    // Typing events
    chatService.addEventListener(ChatEvent.USER_TYPING, handleUserTyping);
    
    // Connection events
    chatService.addEventListener(ChatEvent.USER_ONLINE, () => setIsConnected(true));
    chatService.addEventListener(ChatEvent.USER_OFFLINE, () => setIsConnected(false));
    
    // Chat events
    chatService.addEventListener(ChatEvent.CHAT_CREATED, handleChatCreated);
    chatService.addEventListener(ChatEvent.CHAT_UPDATED, handleChatUpdated);
  };

  const handleNewMessage = (message: Message) => {
    // Add new message to current chat if it matches
    if (currentChatRoom && message.chatRoomId === currentChatRoom.id) {
      setMessages(prev => [...prev, message]);
    }
    
    // Update chat room's last message
    setChatRooms(prev => prev.map(room => 
      room.id === message.chatRoomId 
        ? { ...room, lastMessage: message, unreadCount: room.unreadCount + 1 }
        : room
    ));
  };

  const handleMessageEdited = (message: Message) => {
    if (currentChatRoom && message.chatRoomId === currentChatRoom.id) {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? message : msg
      ));
    }
  };

  const handleMessageDeleted = (data: { messageId: string }) => {
    if (currentChatRoom) {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    }
  };

  const handleMessageRead = (data: { messageId: string }) => {
    if (currentChatRoom) {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, isRead: true } : msg
      ));
    }
  };

  const handleUserTyping = (data: { chatRoomId: string; userId: string; isTyping: boolean }) => {
    if (currentChatRoom && data.chatRoomId === currentChatRoom.id) {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.includes(data.userId) ? prev : [...prev, data.userId];
        } else {
          return prev.filter(id => id !== data.userId);
        }
      });
    }
  };

  const handleChatCreated = (chatRoom: ChatRoom) => {
    setChatRooms(prev => [chatRoom, ...prev]);
  };

  const handleChatUpdated = (chatRoom: ChatRoom) => {
    setChatRooms(prev => prev.map(room => 
      room.id === chatRoom.id ? chatRoom : room
    ));
  };

  const loadChatRooms = async (filters?: ChatFilters) => {
    try {
      setIsLoadingChats(true);
      setError(null);
      
      const result = await chatService.getChatRooms(filters);
      setChatRooms(result.chatRooms);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load chats';
      setError(errorMessage);
      console.error('Error loading chat rooms:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const createChatRoom = async (request: CreateChatRequest): Promise<ChatRoom> => {
    try {
      setError(null);
      
      const chatRoom = await chatService.createChatRoom(request);
      setChatRooms(prev => [chatRoom, ...prev]);
      
      return chatRoom;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create chat';
      setError(errorMessage);
      throw error;
    }
  };

  const selectChatRoom = async (chatRoom: ChatRoom) => {
    try {
      setCurrentChatRoom(chatRoom);
      setMessages([]);
      setTypingUsers([]);
      
      // Load messages for this chat room
      await loadMessages(chatRoom.id);
      
      // Mark chat as read
      await markChatAsRead(chatRoom.id);
    } catch (error) {
      console.error('Error selecting chat room:', error);
    }
  };

  const loadMessages = async (chatRoomId: string, page = 1, filters?: MessageFilters) => {
    try {
      setIsLoadingMessages(true);
      setError(null);
      
      const result = await chatService.getMessages(chatRoomId, page, 50, filters);
      
      if (page === 1) {
        setMessages(result.messages.reverse()); // Reverse to show newest at bottom
      } else {
        // Prepend older messages for pagination
        setMessages(prev => [...result.messages.reverse(), ...prev]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (request: SendMessageRequest) => {
    try {
      setError(null);
      
      await chatService.sendMessage(request);
      // Message will be added via WebSocket event
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      throw error;
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      setError(null);
      
      await chatService.editMessage(messageId, content);
      // Message will be updated via WebSocket event
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to edit message';
      setError(errorMessage);
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      setError(null);
      
      await chatService.deleteMessage(messageId);
      // Message will be removed via WebSocket event
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete message';
      setError(errorMessage);
      throw error;
    }
  };

  const markChatAsRead = async (chatRoomId: string) => {
    try {
      await chatService.markChatAsRead(chatRoomId);
      
      // Update unread count in chat rooms list
      setChatRooms(prev => prev.map(room => 
        room.id === chatRoomId ? { ...room, unreadCount: 0 } : room
      ));
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  const sendTypingIndicator = (chatRoomId: string, isTyping: boolean) => {
    chatService.sendTypingIndicator(chatRoomId, isTyping);
  };

  const archiveChat = async (chatRoomId: string) => {
    try {
      setError(null);
      
      await chatService.archiveChatRoom(chatRoomId);
      
      // Update chat room in list
      setChatRooms(prev => prev.map(room => 
        room.id === chatRoomId ? { ...room, isArchived: true } : room
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive chat';
      setError(errorMessage);
      throw error;
    }
  };

  const unarchiveChat = async (chatRoomId: string) => {
    try {
      setError(null);
      
      await chatService.unarchiveChatRoom(chatRoomId);
      
      // Update chat room in list
      setChatRooms(prev => prev.map(room => 
        room.id === chatRoomId ? { ...room, isArchived: false } : room
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unarchive chat';
      setError(errorMessage);
      throw error;
    }
  };

  const muteChat = async (chatRoomId: string) => {
    try {
      setError(null);
      
      await chatService.muteChatRoom(chatRoomId);
      
      // Update chat room in list
      setChatRooms(prev => prev.map(room => 
        room.id === chatRoomId ? { ...room, isMuted: true } : room
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mute chat';
      setError(errorMessage);
      throw error;
    }
  };

  const unmuteChat = async (chatRoomId: string) => {
    try {
      setError(null);
      
      await chatService.unmuteChatRoom(chatRoomId);
      
      // Update chat room in list
      setChatRooms(prev => prev.map(room => 
        room.id === chatRoomId ? { ...room, isMuted: false } : room
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unmute chat';
      setError(errorMessage);
      throw error;
    }
  };

  const searchMessages = async (query: string, filters?: any): Promise<Message[]> => {
    try {
      setError(null);
      
      const result = await chatService.searchMessages(query, filters);
      return result.messages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshData = async () => {
    try {
      await loadChatRooms();
      
      if (currentChatRoom) {
        await loadMessages(currentChatRoom.id);
      }
    } catch (error) {
      console.error('Error refreshing chat data:', error);
    }
  };

  const value: ChatContextType = {
    // Chat rooms
    chatRooms,
    isLoadingChats,
    
    // Current chat
    currentChatRoom,
    messages,
    isLoadingMessages,
    
    // Real-time status
    isConnected,
    typingUsers,
    
    // Error handling
    error,
    
    // Chat operations
    loadChatRooms,
    createChatRoom,
    selectChatRoom,
    
    // Message operations
    loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markChatAsRead,
    
    // Real-time operations
    sendTypingIndicator,
    
    // Chat management
    archiveChat,
    unarchiveChat,
    muteChat,
    unmuteChat,
    
    // Search
    searchMessages,
    
    // State management
    clearError,
    refreshData,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 