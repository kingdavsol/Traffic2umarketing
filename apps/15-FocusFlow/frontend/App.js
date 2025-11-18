import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as GoogleMobileAds from 'expo-google-mobile-ads';
import { Text } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';

GoogleMobileAds.initialize();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
  </Stack.Navigator>
);

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: {{ backgroundColor: '#2196F3' }},
      headerTintColor: '#fff',
      headerTitleStyle: {{ fontWeight: 'bold' }},
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#999'
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>
      }}
    />
  </Tab.Navigator>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {token ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
