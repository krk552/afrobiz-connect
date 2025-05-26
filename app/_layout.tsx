import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '../contexts/AuthContext';
import { BookingProvider } from '../contexts/BookingContext';
import { ChatProvider } from '../contexts/ChatContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BookingProvider>
          <ChatProvider>
            <StatusBar style="auto" />
            <Stack>
              {/* Onboarding Screen */}
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              
              {/* Authentication Screens */}
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              
              {/* Main App Screens */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              
              {/* Service Detail Screens */}
              <Stack.Screen name="service" options={{ headerShown: false }} />
              
              {/* Chat Screens */}
              <Stack.Screen name="chat" options={{ headerShown: false }} />
              
              {/* Notifications Screen */}
              <Stack.Screen name="notifications" options={{ headerShown: false }} />
              
              {/* Modal Screens */}
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              
              {/* 404 Screen */}
              <Stack.Screen name="+not-found" />
            </Stack>
          </ChatProvider>
        </BookingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
