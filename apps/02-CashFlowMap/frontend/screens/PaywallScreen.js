import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useMonetizationStore } from '../stores/monetizationStore';

const PaywallScreen = ({ navigation }) => {
  const { purchase, products, loading } = useMonetizationStore();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'premium_monthly',
      name: 'Monthly',
      price: '$4.99',
      period: '/month',
      features: [
        '✅ Unlimited access',
        '✅ Premium features',
        '✅ No ads',
        '✅ Priority support'
      ]
    },
    {
      id: 'premium_yearly',
      name: 'Yearly',
      price: '$39.99',
      period: '/year',
      savings: 'Save 33%',
      features: [
        '✅ Unlimited access',
        '✅ Premium features',
        '✅ No ads',
        '✅ Priority support'
      ],
      recommended: true
    }
  ];

  const handlePurchase = async (productId) => {
    try {
      setSelectedPlan(productId);
      const result = await purchase(productId);
      Alert.alert('Success', 'Thank you for your purchase!');
    } catch (error) {
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setSelectedPlan(null);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.title}>Go Premium</Text>
        <Text style={styles.subtitle}>Unlock unlimited features</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {plans.map((plan) => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              plan.recommended && styles.recommendedCard
            ]}
          >
            {plan.recommended && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Recommended</Text>
              </View>
            )}

            <Text style={styles.planName}>{plan.name}</Text>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>{plan.period}</Text>
            </View>

            {plan.savings && (
              <Text style={styles.savings}>{plan.savings}</Text>
            )}

            <View style={styles.features}>
              {plan.features.map((feature, idx) => (
                <Text key={idx} style={styles.feature}>
                  {feature}
                </Text>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                selectedPlan === plan.id && styles.buttonLoading
              ]}
              onPress={() => handlePurchase(plan.id)}
              disabled={loading || selectedPlan === plan.id}
            >
              {selectedPlan === plan.id && loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Subscribe</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Subscription renews automatically. Cancel anytime.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.restoreLink}>Restore Purchase</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 40, alignItems: 'center', paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  content: { padding: 20, paddingBottom: 60 },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  recommendedCard: {
    borderWidth: 2,
    borderColor: '#667eea'
  },
  badge: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  planName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  price: { fontSize: 28, fontWeight: 'bold', color: '#667eea' },
  period: { fontSize: 14, color: '#999', marginLeft: 4 },
  savings: { fontSize: 12, color: '#4CAF50', marginBottom: 16, fontWeight: '600' },
  features: { marginBottom: 20 },
  feature: { fontSize: 14, color: '#666', marginBottom: 8 },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonLoading: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { alignItems: 'center', marginTop: 20 },
  footerText: { fontSize: 12, color: '#999', marginBottom: 12, textAlign: 'center' },
  restoreLink: { color: '#667eea', fontSize: 12, fontWeight: '600' }
});

export default PaywallScreen;
