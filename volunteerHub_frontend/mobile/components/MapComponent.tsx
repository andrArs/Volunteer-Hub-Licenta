import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { getAllEvents } from "@/src/api/event.api";
import { EventResponse } from "@/src/types/event";
import * as Location from 'expo-location';
import { FontAwesome } from "@expo/vector-icons";
import { calculateDistance, formatDistance } from "@/src/utils/location.utils";
import { styles } from "@/src/styles/event.map";

export default function MapComponent() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

  useEffect(() => {
    let locationWatcher: Location.LocationSubscription | null = null;

    const initializeMap = async () => {
      try {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLocation(location.coords);

          locationWatcher = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 10 },
            (newLocation) => {
              setUserLocation(newLocation.coords);
            }
          );
        }

        const data = await getAllEvents();
        const now = new Date();
        const futureEvents = (data || []).filter(ev => {
          const eventDate = new Date(ev.startDateTime);
          return eventDate >= now;
        });

        setEvents(futureEvents);
      } catch (error) {
        console.error("Error initializing map:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (locationWatcher) locationWatcher.remove();
    };
  }, []);

  const mapEvents = useMemo(() => {
    const coordCounts: Record<string, number> = {};
    
    return events.map(ev => {
      let dLat = ev.latitude;
      let dLng = ev.longitude;
      const key = `${dLat.toFixed(4)}-${dLng.toFixed(4)}`; 

      if (coordCounts[key] !== undefined) {
        coordCounts[key] += 1;
        const offset = coordCounts[key] * 0.00015;
        dLat += offset;
        dLng += offset;
      } else {
        coordCounts[key] = 0;
      }

      return { ...ev, displayLat: dLat, displayLng: dLng };
    });
  }, [events]);

  const heatmapPoints = useMemo(() => events.map(ev => ({
    latitude: ev.latitude,
    longitude: ev.longitude,
    weight: 1
  })), [events]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3F5E95" />
      </View>
    );
  }

  const initialRegion = {
    latitude: userLocation ? userLocation.latitude : 45.7489,
    longitude: userLocation ? userLocation.longitude : 21.2087,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {heatmapPoints.length > 0 && (
          <Heatmap
            points={heatmapPoints}
            radius={80} 
            opacity={0.6}
            gradient={{
              colors: ["transparent", "#00FF00", "#FFFF00", "#FF0000"],
              startPoints: [0.05, 0.3, 0.6, 1],
              colorMapSize: 256,
            }}
          />
        )}

        {mapEvents.map(ev => {
          let distanceText = null;
          if (userLocation) {
            const dist = calculateDistance(userLocation.latitude, userLocation.longitude, ev.latitude, ev.longitude);
            distanceText = formatDistance(dist);
          }

          return (
            <Marker
              key={ev.id}
              coordinate={{ latitude: ev.displayLat, longitude: ev.displayLng }}
              pinColor="#3F5E95" 
            >
              <Callout tooltip onPress={() => router.push(`/event.view?id=${ev.id}`)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{ev.title}</Text>
                  {distanceText && (
                    <Text style={styles.calloutDistance}>{distanceText} away</Text>
                  )}
                  <View style={styles.calloutBtn}>
                    <Text style={styles.calloutBtnText}>Go to Event</Text>
                    <FontAwesome name="angle-right" size={16} color="#fff" />
                  </View>
                </View>
                <View style={styles.calloutArrow} />
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}
