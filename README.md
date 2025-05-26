# AfroBiz Connect 🌍

A comprehensive React Native marketplace app connecting African service providers with customers in Namibia and the US diaspora. Built with Expo Router and featuring "Airbnb-level" UI/UX quality.

## 🚀 Features

### 🏪 **Marketplace**
- Service discovery and booking
- Advanced search and filtering
- Real-time availability checking
- Multiple payment methods (including mobile money)
- Rating and review system

### 👥 **User Management**
- Dual user types (customers & businesses)
- Complete authentication system
- Profile management with avatars
- Business profile with location, hours, ratings

### 💬 **Real-time Communication**
- WebSocket-based chat system
- File sharing and attachments
- Typing indicators and read receipts
- Booking-related messaging

### 💳 **Payment Processing**
- Multiple payment methods
- Mobile money integration (MTN, etc.)
- Secure payment processing
- Refund management

### 📱 **Mobile-First Design**
- Beautiful glassmorphism UI
- Responsive design
- Professional component library
- Smooth animations and transitions

## 🛠 Tech Stack

- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router
- **State Management**: React Context API
- **UI Components**: Custom component library
- **Styling**: StyleSheet with glassmorphism design
- **Real-time**: WebSocket integration
- **Storage**: AsyncStorage for persistence
- **Icons**: Expo Vector Icons

## 📁 Project Structure

```
AfroBizConnect/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── chat/              # Chat screens
│   └── service/           # Service detail screens
├── components/            # Reusable UI components
│   ├── ui/                # Core UI components
│   └── home/              # Home-specific components
├── contexts/              # React Context providers
├── services/              # API and business logic
├── constants/             # App constants
└── assets/               # Images and static files
```

## 🏗 Architecture

### Service Layer
- **API Service**: HTTP client with authentication and error handling
- **Auth Service**: User authentication and profile management
- **Booking Service**: Service discovery, booking, and payment processing
- **Chat Service**: Real-time messaging with WebSocket integration

### Context Layer
- **AuthContext**: User authentication state
- **BookingContext**: Service and booking management
- **ChatContext**: Real-time chat functionality

### UI Components
- **Button**: Multiple variants with loading states
- **Input**: Form inputs with validation
- **Card**: Flexible card components
- **ServiceCard**: Specialized service display

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/afrobiz-connect.git
   cd afrobiz-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## 🌍 Target Markets

### Primary Markets
- **Namibia**: Local service providers and customers
- **US Diaspora**: African immigrants seeking cultural services

### Service Categories
- Beauty & Hair Care
- Food & Catering
- Fashion & Tailoring
- Home Services
- Technology Support
- Fitness & Wellness

## 💰 Payment Integration

### Supported Methods
- **Mobile Money**: MTN Mobile Money, Airtel Money
- **Credit/Debit Cards**: Visa, Mastercard
- **Bank Transfers**: Local banking integration
- **Cash**: For in-person services

## 🔧 Development Status

### ✅ Completed
- Complete service layer with mock data fallbacks
- Authentication system with user management
- Booking and payment processing
- Real-time chat functionality
- Professional UI component library
- All main screens (Home, Explore, Bookings, Dashboard, Profile)
- TypeScript integration
- Error handling and loading states

### 🚧 In Progress
- Backend API integration
- Payment gateway integration
- Push notifications
- Advanced search algorithms

### 📋 Roadmap
- [ ] Backend API development
- [ ] Payment gateway integration
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Offline functionality
- [ ] App store deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Developer**: Karl Kiam
- **Email**: your.email@example.com
- **Project Link**: https://github.com/yourusername/afrobiz-connect

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Native community for excellent libraries
- African entrepreneurs inspiring this marketplace vision

---

**Built with ❤️ for the African diaspora community** 