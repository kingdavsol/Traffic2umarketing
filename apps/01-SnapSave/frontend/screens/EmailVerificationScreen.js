import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useAuthStore } from '../stores/authStore';

const EmailVerificationScreen = ({ navigation }) => {
  const [token, setToken] = useState('');
  const { verifyEmail, loading } = useAuthStore();

  const handleVerify = async () => {
    if (!token) {
      Alert.alert('Error', 'Please enter verification code');
      return;
    }
    try {
      await verifyEmail(token);
      Alert.alert('Success', 'Email verified!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code');
    }
  };

  return (
    <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>Enter the code sent to your email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter code"
          value={token}
          onChangeText={setToken}
          editable={!loading}
        />
        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  content: { backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { width: '100%', backgroundColor: '#2196F3', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default EmailVerificationScreen;
