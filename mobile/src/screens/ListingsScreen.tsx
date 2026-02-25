import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ListingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Listings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 24, fontWeight: "bold" },
});
