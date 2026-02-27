import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return null; // Show loading state while checking auth
  }

  console.log('Rendering navigation, isAuthenticated:', isAuthenticated);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#0F2027',
        },
      }}
    >
      {isAuthenticated ? (
        // Authenticated user routes
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // Unauthenticated user routes
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootLayoutNav />
    </AuthProvider>
  );
}
