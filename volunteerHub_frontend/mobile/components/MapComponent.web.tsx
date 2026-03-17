import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";

export default function MapComponent() {
  return (
    <View style={styles.container}>
      <FontAwesome name="map-o" size={60} color="#8B93A7" style={{ marginBottom: 20 }} />
      <Text style={styles.title}>Map View is Mobile-Only</Text>
      <Text style={styles.subtitle}>
        Please open the VolunteerHub app on an Android or iOS device to explore the interactive heatmap.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E2A3B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#8B93A7',
    textAlign: 'center',
    lineHeight: 22,
  },
});