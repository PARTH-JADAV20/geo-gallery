import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to main app
    if (!isLoading && isAuthenticated) {
      // This will be handled by the root layout
    }
  }, [isAuthenticated, isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Login',
          animationTypeForReplace: isAuthenticated ? 'push' : 'pop',
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: 'Register',
          animationTypeForReplace: isAuthenticated ? 'push' : 'pop',
        }} 
      />
    </Stack>
  );
}
