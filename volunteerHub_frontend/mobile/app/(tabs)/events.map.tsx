import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from "@expo/vector-icons";
import MapComponent from '@/components/MapComponent';

export default function EventsMapScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      <MapComponent />

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={20} color="#3F5E95" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  }
});