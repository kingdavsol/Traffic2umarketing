import { BottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

const Tab = BottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function AppLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'vehicles') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'maintenance') {
            iconName = focused ? 'wrench' : 'wrench-outline';
          } else if (route.name === 'deals') {
            iconName = focused ? 'pricetag' : 'pricetag-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0052CC',
        tabBarInactiveTintColor: '#8B8B8B'
      })}
    >
      <Tab.Screen name="index" options={{ title: 'Home' }} />
      <Tab.Screen name="vehicles" options={{ title: 'Vehicles' }} />
      <Tab.Screen name="maintenance" options={{ title: 'Maintenance' }} />
      <Tab.Screen name="deals" options={{ title: 'Deals' }} />
      <Tab.Screen name="profile" options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
