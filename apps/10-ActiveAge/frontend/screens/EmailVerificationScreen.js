import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { BannerAd, BannerAdSize } from 'expo-google-mobile-ads';

const EmailVerificationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  return (
    <View style={{styles.container}}>
      <LinearGradient colors=['{color0}', '{color1}'] style={{styles.header}}>
        <Text style={{styles.title}}>
          👵 ActiveAge
        </Text>
        <Text style={{styles.subtitle}}>
          Feature: Fall detection and medication reminders for seniors
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{styles.content}}>
        <Text style={{styles.featureText}}>
          Loading EmailVerificationScreen...
        </Text>
      </ScrollView>

      <View style={{styles.adContainer}}>
        <BannerAd
          unitId="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy"
          size={{BannerAdSize.ANCHORED_ADAPTIVE_BANNER}}
          requestOptions={{ requestNonPersonalizedAds: true }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 24, paddingTop: 40, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  content: { padding: 16, paddingBottom: 100 },
  featureText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 32 },
  adContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50 }
});

export default EmailVerificationScreen;
