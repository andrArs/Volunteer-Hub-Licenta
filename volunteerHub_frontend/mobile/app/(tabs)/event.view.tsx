import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { getEventById, deleteEvent } from "@/src/api/event.api";
import { getAuth } from "@/src/store/auth.store"; 
import { EVENT_CATEGORIES, type EventResponse } from "@/src/types/event";
import { styles } from "@/src/styles/event.view.styles";

type AttendanceStatus = "none" | "interested" | "going";

function categoryLabel(cat: number) {
  return EVENT_CATEGORIES.find((c) => c.value === cat)?.label ?? "Unknown";
}

function formatStart(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return `${dd}-${mm}-${yyyy} at ${hh}:${mi}`;
}

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const auth = getAuth();
  const myUserId = auth?.userId ?? null;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventResponse | null>(null);

  const [status, setStatus] = useState<AttendanceStatus>("none");

  const [busyDelete, setBusyDelete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getEventById(String(id));
      setEvent(data);
    } finally {
      setLoading(false);
    }
  }, [id]);
  

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setStatus("none");
  }, [id]);

  const isMine = useMemo(() => {
    if (!event) return false;
    if (!myUserId) return false;
    return String(event.createdById) === String(myUserId);
  }, [event, myUserId]);
//----
  const participantsCount = (event as any)?.participantsCount ?? (event as any)?.volunteersCount ?? null;
  const capacity = event?.maxVolunteers ?? null;

  const isFull = useMemo(() => {
    if (participantsCount == null) return false;
    if (capacity == null) return false;
    return Number(participantsCount) >= Number(capacity);
  }, [participantsCount, capacity]);

  const participantText = useMemo(() => {
    if (participantsCount == null && capacity == null) return null;
    if (participantsCount != null && capacity != null) return `${participantsCount}/${capacity} people going`;
    if (participantsCount != null) return `${participantsCount} people going`;
    if (capacity != null) return `0/${capacity} people going`;
    return null;
  }, [participantsCount, capacity]);

  function onInterested() {
    if (!event) return;
    const next: AttendanceStatus = status === "interested" ? "none" : "interested";
    setStatus(next);
    console.log("attendance status:", { eventId: event.id, status: next });
  }

  function onGoing() {
    if (!event) return;
    if (isFull) return;
    const next: AttendanceStatus = status === "going" ? "none" : "going";
    setStatus(next);
    console.log("attendance status:", { eventId: event.id, status: next });
  }

  function onEdit() {
    if (!event) return;
    router.push({ pathname: "/event.update", params: { id: event.id } });
  }

  function onDeleteClick() {
    if (!event) return;
    setShowDeleteModal(true);
  }

  async function executeDelete() {
    if (!event) return;
    try {
      setBusyDelete(true);
      await deleteEvent(event.id);
      
      setShowDeleteModal(false);
      router.replace("/events.view");
    } catch (error) {
      alert("You don't have permission to delete this event or an error occurred.");
    } finally {
      setBusyDelete(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Event not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
  <View style={styles.page}>
    <View style={styles.header}>
      <Pressable
        onPress={() => router.replace("/events.view")}
        hitSlop={10}
        style={styles.backBtn}
      >
        <FontAwesome name="arrow-left" size={18} color="#fff" />
      </Pressable>

      <Text style={styles.headerTitle}>Event Details</Text>
      <View style={styles.rightSpacer} />
    </View>

    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{event.title}</Text>

      <View style={styles.categoryPill}>
        <Text style={styles.categoryText}>{categoryLabel(event.category)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>
        {event.description?.trim() ? event.description : "—"}
      </Text>

      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <FontAwesome name="calendar" size={16} color="#3F5E95" />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Date & Time</Text>
            <Text style={styles.infoValue}>{formatStart(event.startDateTime)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <FontAwesome name="map-marker" size={16} color="#3F5E95" />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{event.locationName || ".."}</Text>
            {!!event.address && (
              <Text style={styles.infoSubValue}>{event.address}</Text>
            )}
            <Text style={styles.infoSubValue}>.. km away</Text>
          </View>
        </View>

        {capacity ? (
          <View style={styles.infoRow}>
            <FontAwesome name="user" size={16} color="#3F5E95" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Participants</Text>
              <Text style={styles.infoValue}>{participantText}</Text>
              {isFull ? (
                <Text style={styles.fullText}>Event is full</Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>

      {isMine ? (
        <>
          <Text style={styles.sectionTitle}>Admin Controls</Text>

          <View style={styles.actionsRow}>
            <Pressable style={styles.secondaryBtn} onPress={onEdit}>
              <FontAwesome name="pencil" size={14} color="#3F5E95" />
              <Text style={styles.secondaryBtnText}>Edit Event</Text>
            </Pressable>

            <Pressable
              style={[styles.dangerBtn]}
              onPress={onDeleteClick}
            
            >
              <FontAwesome name="trash" size={14} color="#8E1B1B" />
              <Text style={styles.dangerBtnText}>
                {busyDelete ? "Deleting..." : "Delete"}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.actionsRow}>
          <Pressable
            style={[
              styles.secondaryBtn,
              status === "interested" && styles.secondaryBtnActive,
            ]}
            onPress={onInterested}
          >
            <FontAwesome
              name={status === "interested" ? "star" : "star-o"}
              size={14}
              color={status === "interested" ? "#FFFFFF" : "#3F5E95"}
            />
            <Text
              style={[
                styles.secondaryBtnText,
                status === "interested" && styles.secondaryBtnTextActive,
              ]}
            >
              Interested
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.primaryBtn,
              status === "going" && styles.primaryBtnActive,
              isFull && styles.primaryBtnDisabled,
            ]}
            onPress={onGoing}
            disabled={isFull}
          >
            <FontAwesome name="plus" size={14} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>
              {isFull ? "Full" : status === "going" ? "Going" : "I'm Going"}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)} 
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Event</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this event? This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => setShowDeleteModal(false)}
                disabled={busyDelete}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.dangerBtn, busyDelete && styles.btnDisabled]}
                onPress={executeDelete}
                disabled={busyDelete}
              >
              <FontAwesome name="trash" size={14} color="#8E1B1B" />
              <Text style={styles.dangerBtnText}>
                {busyDelete ? "Deleting..." : "Delete"}
              </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
  </View>
);}
