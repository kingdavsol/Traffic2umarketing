import { Stack } from 'expo-router';
import { useAuth } from '@/store/auth';
import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  const { token, setToken, setUser } = useAuth();

  useEffect(() => {
    const restoreToken = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('token');
        if (savedToken) {
          setToken(savedToken);
        }
      } catch (e) {
        console.log('Failed to restore token');
      }
    };

    restoreToken();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      {token ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
