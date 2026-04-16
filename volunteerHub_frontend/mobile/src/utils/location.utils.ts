import { api } from "../api/client";

const EARTH_RADIUS_KM = 6371;

const toRad = (value: number) => (value * Math.PI) / 180;

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2); // Haversine formula

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

export const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1.0) {
        return `${Math.round(distanceKm * 1000)}m away`;
    } else if (distanceKm < 10.0) {
        return `${distanceKm.toFixed(1)}km away`;
    } else {
        return `${Math.round(distanceKm)}km away`;
    }
};

export const getPlacesSuggestions = async (query: string) => {
    if (query.trim().length < 3) return [];

    try {
        const response = await api.get(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);

        if (response.data.status === "OK") {
            return response.data.predictions.map((item: any) => ({
                placeId: item.place_id,
                title: item.structured_formatting.main_text,
                description: item.description,
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
        return [];
    }
};

export const getLatLongFromPlaceId = async (placeId: string) => {
    try {
        const response = await api.get(`/api/places/details?placeId=${encodeURIComponent(placeId)}`);
        const data = response.data;

        if (data.status === "OK" && data.result) {
            return {
                latitude: data.result.geometry.location.lat,
                longitude: data.result.geometry.location.lng,
                address: data.result.formatted_address,
            };
        }
        throw new Error("Location details not found");
    } catch (error) {
        console.error("Error fetching lat/long:", error);
        return null;
    }
};