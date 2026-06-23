import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { getEventStats, type EventStatsResponse } from "@/src/api/event.api";
import { t, useLanguage } from "@/src/i18n/index";
import { styles } from "@/src/styles/event.stats.styles";

export default function EventStatsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  useLanguage();

  const [stats, setStats] = useState<EventStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getEventStats(String(id));
        setStats(data);
      } catch {
        setErr(t("eventStats.failedToLoad"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{t("eventStats.title")}</Text>
        <View style={styles.rightSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : err ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{err}</Text>
        </View>
      ) : stats ? (
        <View style={styles.content}>

          <Text style={styles.sectionTitle}>{t("eventStats.attendance")}</Text>
          <View style={styles.card}>
            <Row
              icon="check-circle"
              iconColor="#3F5E95"
              label={t("eventStats.attended")}
              value={String(stats.attendedCount)}
            />
            <Divider />
            <Row
              icon="users"
              iconColor="#3F5E95"
              label={t("eventStats.registered")}
              value={String(stats.goingCount)}
            />
            {stats.maxVolunteers ? (
              <>
                <Divider />
                <Row
                  icon="star"
                  iconColor="#3F5E95"
                  label={t("eventStats.capacity")}
                  value={String(stats.maxVolunteers)}
                />
              </>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>{t("eventStats.ageRange")}</Text>
          <View style={styles.card}>
            {stats.minAge != null && stats.maxAge != null ? (
              <>
                <Row
                  icon="arrows-h"
                  iconColor="#3F5E95"
                  label={t("eventStats.ageRange")}
                  value={t("eventStats.ageRangeValue", { min: stats.minAge, max: stats.maxAge })}
                />
                {stats.averageAge != null ? (
                  <>
                    <Divider />
                    <Row
                      icon="calculator"
                      iconColor="#3F5E95"
                      label={t("eventStats.averageAge")}
                      value={t("eventStats.averageAgeValue", { avg: stats.averageAge })}
                    />
                  </>
                ) : null}
              </>
            ) : (
              <Text style={styles.emptyText}>{t("eventStats.noAttendees")}</Text>
            )}
          </View>

        </View>
      ) : null}
    </View>
  );
}

function Row({ icon, iconColor, label, value }: { icon: string; iconColor: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <FontAwesome name={icon as any} size={16} color={iconColor} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

