import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useAuthStore } from '../stores/authStore';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: '',
    savingsGoal: '',
    monthlyIncome: ''
  });

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#673AB7', '#512DA8']} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.firstName || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <SettingItem label="Email" value={user?.email || ''} editable={false} />
          <SettingItem
            label="First Name"
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            editable={editing}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Notifications</Text>
            <Text style={styles.preferenceValue}>Enabled</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Currency</Text>
            <Text style={styles.preferenceValue}>USD</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const SettingItem = ({ label, value, onChangeText, editable }) => (
  <View style={styles.settingItem}>
    <Text style={styles.settingLabel}>{label}</Text>
    {editable ? (
      <TextInput style={styles.settingInput} value={value} onChangeText={onChangeText} />
    ) : (
      <Text style={styles.settingValue}>{value}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 30, alignItems: 'center', paddingTop: 40 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  content: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  settingItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  settingLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  settingValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  settingInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 8, width: '50%' },
  preferenceItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  preferenceLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  preferenceValue: { fontSize: 14, color: '#673AB7', fontWeight: '600' },
  logoutButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ProfileScreen;
