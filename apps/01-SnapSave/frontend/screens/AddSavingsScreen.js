import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Picker
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useSavingsStore } from '../stores/savingsStore';

const AddSavingsScreen = () => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('manual');
  const [description, setDescription] = useState('');
  const { addSaving, loading } = useSavingsStore();

  const handleAddSaving = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await addSaving(parseFloat(amount), type, description);
      Alert.alert('Success', 'Saving added! 🎉');
      setAmount('');
      setDescription('');
      setType('manual');
    } catch (error) {
      Alert.alert('Error', 'Failed to add saving');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.header}>
          <Text style={styles.title}>Add Savings</Text>
          <Text style={styles.subtitle}>Track your progress 💪</Text>
        </LinearGradient>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type</Text>
            <Picker
              selectedValue={type}
              onValueChange={setType}
              style={styles.picker}
            >
              <Picker.Item label="Manual" value="manual" />
              <Picker.Item label="Round Up" value="roundup" />
              <Picker.Item label="Recurring" value="recurring" />
            </Picker>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="What's this saving for?"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAddSaving}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Adding...' : 'Add Saving'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Savings Tips</Text>
          <TipItem text="Round up your purchases automatically" />
          <TipItem text="Set recurring savings from your income" />
          <TipItem text="Track specific goals to stay motivated" />
        </View>
      </ScrollView>
    </View>
  );
};

const TipItem = ({ text }) => (
  <View style={styles.tipItem}>
    <Text style={styles.tipBullet}>•</Text>
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  header: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center'
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  picker: { borderWidth: 1, borderColor: '#ddd' },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  tipsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  tipsTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  tipItem: { flexDirection: 'row', marginBottom: 10 },
  tipBullet: { fontSize: 20, color: '#4CAF50', marginRight: 8, fontWeight: 'bold' },
  tipText: { fontSize: 14, color: '#666', flex: 1 }
});

export default AddSavingsScreen;
