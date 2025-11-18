import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useSavingsStore } from '../stores/savingsStore';

const GoalsScreen = () => {
  const { goals, createGoal, getGoals, loading } = useSavingsStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    category: 'savings'
  });

  useEffect(() => {
    getGoals();
  }, []);

  const handleCreateGoal = async () => {
    if (!formData.title || !formData.targetAmount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const deadline = new Date();
      deadline.setFullYear(deadline.getFullYear() + 1);

      await createGoal(
        formData.title,
        parseFloat(formData.targetAmount),
        deadline,
        formData.category
      );

      Alert.alert('Success', 'Goal created! 🎯');
      setFormData({ title: '', targetAmount: '', category: 'savings' });
      setModalVisible(false);
      getGoals();
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.header}>
        <Text style={styles.title}>My Goals</Text>
        <Text style={styles.subtitle}>Save with purpose 🎯</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {goals && goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubtext}>Create your first goal to get started!</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Goal</Text>

            <TextInput
              style={styles.input}
              placeholder="Goal name (e.g., Emergency Fund)"
              value={formData.title}
              onChangeText={(text) =>
                setFormData({ ...formData, title: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Target amount ($)"
              keyboardType="decimal-pad"
              value={formData.targetAmount}
              onChangeText={(text) =>
                setFormData({ ...formData, targetAmount: text })
              }
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreateGoal}
              >
                <Text style={[styles.buttonText, { color: '#fff' }]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const GoalCard = ({ goal }) => {
  const progress = Math.min((goal.progress / 100) * 100, 100);

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>{goal.title}</Text>
        <Text style={styles.goalPercentage}>{Math.round(goal.progress)}%</Text>
      </View>

      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.progressBarBg}
      >
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${progress}%` }]}
        />
      </LinearGradient>

      <View style={styles.goalFooter}>
        <Text style={styles.goalAmount}>
          ${goal.currentAmount?.toLocaleString() || '0'} / ${goal.targetAmount?.toLocaleString() || '0'}
        </Text>
        <Text style={styles.goalDeadline}>
          Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No date'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center'
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  content: { padding: 16, paddingBottom: 100 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#999' },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  goalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  goalPercentage: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  progressBarBg: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%' },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  goalAmount: { fontSize: 12, color: '#666', fontWeight: '600' },
  goalDeadline: { fontSize: 12, color: '#999' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  fabText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: '40%',
    alignItems: 'center'
  },
  cancelButton: { backgroundColor: '#e0e0e0' },
  createButton: { backgroundColor: '#FF9800' },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#333' }
});

export default GoalsScreen;
