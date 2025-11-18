import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as GoogleMobileAds from 'expo-google-mobile-ads';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddSavingsScreen from './screens/AddSavingsScreen';
import GoalsScreen from './screens/GoalsScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import ProfileScreen from './screens/ProfileScreen';

import { useAuthStore } from './stores/authStore';
import { useSavingsStore } from './stores/savingsStore';

// Initialize Google Mobile Ads
GoogleMobileAds.initialize();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
  </Stack.Navigator>
);

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#2196F3' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#999'
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>
      }}
    />
    <Tab.Screen
      name="AddSavings"
      component={AddSavingsScreen}
      options={{
        tabBarLabel: 'Add',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>➕</Text>
      }}
    />
    <Tab.Screen
      name="Goals"
      component={GoalsScreen}
      options={{
        tabBarLabel: 'Goals',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎯</Text>
      }}
    />
    <Tab.Screen
      name="Analytics"
      component={AnalyticsScreen}
      options={{
        tabBarLabel: 'Analytics',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>
      }}
    />
    <Tab.Screen
      name="Achievements"
      component={AchievementsScreen}
      options={{
        tabBarLabel: 'Rewards',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏆</Text>
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
  const { token, setToken } = useAuthStore();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('authToken');
        if (savedToken) setToken(savedToken);
      } catch (e) {
        console.error('Failed to restore token:', e);
      }
      setIsReady(true);
    };

    bootstrapAsync();
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
