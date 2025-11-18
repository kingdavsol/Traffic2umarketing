import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { BannerAd, BannerAdSize } from 'expo-google-mobile-ads';
import { useSavingsStore } from '../stores/savingsStore';
import { useAuthStore } from '../stores/authStore';

const DashboardScreen = ({ navigation }) => {
  const { analytics, loading, getAnalytics } = useSavingsStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await getAnalytics();
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.header}>
          <Text style={styles.greeting}>Welcome, {user?.firstName || 'User'}! 👋</Text>
          <Text style={styles.subGreeting}>Your savings journey</Text>
        </LinearGradient>

        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Total Savings Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Total Saved</Text>
                <Text style={styles.totalAmount}>
                  ${analytics?.totalSaved?.toLocaleString() || '0'}
                </Text>
              </View>
              <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min((analytics?.totalSaved / 10000) * 100, 100)}%` }
                  ]}
                />
              </LinearGradient>
              <Text style={styles.progressText}>
                Progress: {Math.round((analytics?.totalSaved / 10000) * 100)}% to $10,000
              </Text>
            </View>

            {/* Savings by Type */}
            {analytics?.byType && analytics.byType.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Savings by Type</Text>
                {analytics.byType.map((type) => (
                  <View key={type._id} style={styles.typeItem}>
                    <View>
                      <Text style={styles.typeName}>
                        {type._id.charAt(0).toUpperCase() + type._id.slice(1)}
                      </Text>
                      <Text style={styles.typeCount}>{type.count} times</Text>
                    </View>
                    <Text style={styles.typeAmount}>${type.total.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Monthly Breakdown */}
            {analytics?.monthlyData && analytics.monthlyData.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Monthly Breakdown</Text>
                {analytics.monthlyData.slice(-6).map((month) => (
                  <View key={`${month._id.year}-${month._id.month}`} style={styles.monthItem}>
                    <Text style={styles.monthName}>
                      {month._id.month} {month._id.year}
                    </Text>
                    <Text style={styles.monthAmount}>${month.total.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AddSavings')}
              >
                <Text style={styles.actionEmoji}>➕</Text>
                <Text style={styles.actionText}>Add Savings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Goals')}
              >
                <Text style={styles.actionEmoji}>🎯</Text>
                <Text style={styles.actionText}>My Goals</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Ad Banner */}
      <View style={styles.adContainer}>
        <BannerAd
          unitId="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy"
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAds: true }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100
  },
  header: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50'
  },
  progressText: {
    fontSize: 12,
    color: '#666'
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  typeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  typeCount: {
    fontSize: 12,
    color: '#999'
  },
  typeAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  monthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  monthName: {
    fontSize: 14,
    color: '#666'
  },
  monthAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333'
  },
  adContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50
  }
});

export default DashboardScreen;
