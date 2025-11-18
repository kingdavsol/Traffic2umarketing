import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useSavingsStore } from '../stores/savingsStore';

const AnalyticsScreen = () => {
  const { analytics, loading, getAnalytics } = useSavingsStore();

  useEffect(() => {
    getAnalytics();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#9C27B0', '#7B1FA2']} style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator size="large" /> : <Text style={styles.text}>Analytics Data</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  content: { padding: 16 },
  text: { fontSize: 16, color: '#666', textAlign: 'center' }
});

export default AnalyticsScreen;
