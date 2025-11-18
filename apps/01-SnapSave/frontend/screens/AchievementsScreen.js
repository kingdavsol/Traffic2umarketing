import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useSavingsStore } from '../stores/savingsStore';

const AchievementsScreen = () => {
  const { achievements, loading, getAchievements } = useSavingsStore();

  useEffect(() => {
    getAchievements();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF6F00', '#E65100']} style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : achievements && achievements.length > 0 ? (
          achievements.map((achievement) => (
            <View key={achievement.id} style={styles.card}>
              <Text style={styles.trophy}>🏆</Text>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.points}>+{achievement.points} points</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No achievements yet. Keep saving!</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  content: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center' },
  trophy: { fontSize: 40, marginBottom: 8 },
  achievementTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  points: { fontSize: 12, color: '#FF6F00', fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 40 }
});

export default AchievementsScreen;
