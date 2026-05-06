import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { goBack } from "@/src/utils/navigation";
import { FontAwesome } from "@expo/vector-icons";
import MapComponent from '@/components/MapComponent';
import { styles } from "@/src/styles/map.styles";

export default function EventsMapScreen() {
  return (
    <View style={styles.container}>
      
      <MapComponent />

      <Pressable style={styles.backBtn} onPress={() => goBack("/events.view")}>
        <FontAwesome name="arrow-left" size={20} color="#3F5E95" />
      </Pressable>
    </View>
  );
}
