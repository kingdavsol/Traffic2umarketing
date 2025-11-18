import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useAuthStore } from '../stores/authStore';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' });
  const { register, loading, error } = useAuthStore();

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.firstName) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      await register(form.email, form.password, form.firstName, form.lastName, form.phone);
      Alert.alert('Success', 'Check your email to verify your account');
      navigation.navigate('EmailVerification');
    } catch (err) {
      Alert.alert('Registration Failed', error);
    }
  };

  return (
    <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={form.firstName}
            onChangeText={(text) => setForm({ ...form, firstName: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={form.lastName}
            onChangeText={(text) => setForm({ ...form, lastName: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, justifyContent: 'center', minHeight: '100%' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 30, textAlign: 'center' },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  button: { backgroundColor: '#2196F3', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#2196F3', textAlign: 'center', marginTop: 16, fontSize: 14, fontWeight: '500' }
});

export default RegisterScreen;
