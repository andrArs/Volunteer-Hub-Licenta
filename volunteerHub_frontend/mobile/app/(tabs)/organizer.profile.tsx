import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { goBack } from "@/src/utils/navigation";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { getOrganizerReviews } from "@/src/api/review.api";
import type { OrganizerReviewsResponse, ReviewResponse } from "@/src/types/review";
import { styles } from "@/src/styles/organizer.profile.styles";

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FontAwesome
          key={s}
          name={s <= Math.round(rating) ? "star" : "star-o"}
          size={size}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

function ReviewCard({ item }: { item: ReviewResponse }) {
  const date = new Date(item.createdAt);
  const formatted = `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.flex1}>
          <Text style={styles.reviewerName}>{item.reviewerName}</Text>
          <Text style={styles.reviewEvent}>{item.eventTitle}</Text>
        </View>
        <View style={styles.reviewRatingCol}>
          <StarRating rating={item.rating} size={13} />
          <Text style={styles.reviewDate}>{formatted}</Text>
        </View>
      </View>
      {!!item.comment && (
        <Text style={styles.reviewComment}>{item.comment}</Text>
      )}
    </View>
  );
}

export default function OrganizerProfileScreen() {
  const router = useRouter();
  const { organizerId } = useLocalSearchParams<{ organizerId: string }>();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OrganizerReviewsResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!organizerId) return;
    try {
      setLoading(true);
      setNotFound(false);
      const result = await getOrganizerReviews(String(organizerId));
      setData(result);
    } catch (err: any) {
      if (err?.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack()} hitSlop={10} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Organizer Profile</Text>
        <View style={styles.rightSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : notFound || !data ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Organizer not found.</Text>
          <Pressable onPress={() => goBack()} style={styles.backTextBtn}>
            <Text style={styles.backTextBtnText}>Go back</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data.reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReviewCard item={item} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.profileCard}>
                <View style={styles.avatarCircle}>
                  <FontAwesome name="user" size={32} color="#3F5E95" />
                </View>
                <Text style={styles.organizerName}>{data.organizerName}</Text>

                <View style={styles.ratingRow}>
                  <StarRating rating={data.averageRating} size={22} />
                  <Text style={styles.ratingValue}>{data.averageRating.toFixed(1)}</Text>
                </View>
                <Text style={styles.totalReviews}>
                  {data.totalReviews === 0
                    ? "No reviews yet"
                    : `${data.totalReviews} review${data.totalReviews > 1 ? "s" : ""}`}
                </Text>
              </View>

              {data.reviews.length > 0 && (
                <Text style={styles.sectionTitle}>Reviews</Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <FontAwesome name="comments-o" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No reviews yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
