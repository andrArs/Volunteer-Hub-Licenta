import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { goBack } from "@/src/utils/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { getEventById, deleteEvent, updateEventAttendance, getEventParticipantsCount, getUserEventStatus } from "@/src/api/event.api";
import { getMyReviewStatus, createReview } from "@/src/api/review.api";
import { getAuth } from "@/src/store/auth.store";
import { EVENT_CATEGORIES, EventStatus, type EventResponse } from "@/src/types/event";
import { styles } from "@/src/styles/event.view.styles";
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { calculateDistance, formatDistance } from "@/src/utils/location.utils";
import { addEventToCalendar, removeEventFromCalendar } from "@/src/utils/calendar.utils";
import { setEventStatus } from "@/src/api/admin.api";

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

function renderStatusBadge(rawStatus: EventStatus | string | number | undefined) {
  if (rawStatus === undefined || rawStatus === null) return null;
  const status = Number(rawStatus);

  let bgColor = "#E5E7EB"; 
  let textColor = "#374151";
  let label = "UNKNOWN";

  if (status === EventStatus.Pending) {
    bgColor = "#FEF3C7"; 
    textColor = "#D97706"; 
    label = "PENDING";
  } else if (status === EventStatus.Approved) {
    bgColor = "#D1FAE5"; 
    textColor = "#059669"; 
    label = "APPROVED";
  } else if (status === EventStatus.Rejected) {
    bgColor = "#FEE2E2"; 
    textColor = "#DC2626"; 
    label = "REJECTED";
  }

  return (
    <View style={{
      backgroundColor: bgColor,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    }}>
      <Text style={{ color: textColor, fontSize: 11, fontWeight: '800' }}>
        {label}
      </Text>
    </View>
  );
}

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const auth = getAuth();
  const myUserId = auth?.userId ?? null;
  const isAdmin = auth?.roles?.includes("Admin") ?? auth?.roles?.includes("Admin") ?? false;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [event, setEvent] = useState<EventResponse | null>(null);

  const [status, setStatus] = useState<AttendanceStatus>("none");

  const [busyDelete, setBusyDelete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busyStatusUpdate, setBusyStatusUpdate] = useState(false);

  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [busyReview, setBusyReview] = useState(false);

  const [participantsCount, setParticipantsCount] = useState<number | null>(null);

  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!id) return;
    try {
      if (!isRefresh) setLoading(true);
      const [data, count, attendStatus] = await Promise.all([
        getEventById(String(id)),
        getEventParticipantsCount(String(id)),
        getUserEventStatus(String(id)),
      ]);
      setEvent(data);
      setParticipantsCount(count);
      setStatus(attendStatus as AttendanceStatus);

      if (myUserId) {
        const reviewed = await getMyReviewStatus(String(id)).catch(() => false);
        setHasReviewed(reviewed);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, myUserId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);
  

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation(loc.coords);
      } catch (e) {
        console.error("Error getting location:", e);
      }
    })();
  }, []);

  const isMine = useMemo(() => {
    if (!event) return false;
    if (!myUserId) return false;
    return String(event.createdById) === String(myUserId);
  }, [event, myUserId]);

  const capacity = event?.maxVolunteers ?? null;
  const isFull = useMemo(() => {
    if (participantsCount == null) return false;
    if (capacity == null || capacity <= 0) return false;
    return Number(participantsCount) >= Number(capacity);
  }, [participantsCount, capacity]);

  const participantText = useMemo(() => {
    if (participantsCount == null && capacity == null) return null;
    if (participantsCount != null && capacity != null) return `${participantsCount}/${capacity} people going`;
    if (participantsCount != null) return `${participantsCount} people going`;
    if (capacity != null) return `0/${capacity} people going`;
    return null;
  }, [participantsCount, capacity]);

  const displayLocationName = useMemo(() => {
    if (!event?.locationName) return "..";
    if (event.locationName.includes(" (")) {
      return event.locationName.split(" (")[0]; 
    }
    return event.locationName;
  }, [event?.locationName]);

  const distanceText = useMemo(() => {
    if (!userLocation || !event?.latitude || !event?.longitude) return null;
    const dist = calculateDistance(
      userLocation.latitude, 
      userLocation.longitude, 
      event.latitude, 
      event.longitude
    );
    return formatDistance(dist);
  }, [userLocation, event]);

  const isPastEvent = useMemo(() => {
    if (!event?.startDateTime) return false;
    return new Date(event.startDateTime).getTime() < new Date().getTime();
  }, [event?.startDateTime]);

  const isEventEnded = useMemo(() => {
    if (!event?.endDateTime) return false;
    return new Date(event.endDateTime).getTime() < new Date().getTime();
  }, [event?.endDateTime]);

  const canReview = isEventEnded && status === "going" && !isMine && !!myUserId;

  async function handleApprove() {
    if (!event) return;
    try {
      setBusyStatusUpdate(true);
      await setEventStatus(event.id, EventStatus.Approved, "");
      Alert.alert("Success", "Event approved successfully!");
      goBack("/events.view"); 
    } catch (error) {
      Alert.alert("Error", "Could not approve event.");
    } finally {
      setBusyStatusUpdate(false);
    }
  }

  async function handleReject() {
    if (!event || !rejectReason.trim()) {
      Alert.alert("Required", "Please provide a reason for rejection.");
      return;
    }
    try {
      setBusyStatusUpdate(true);
      await setEventStatus(event.id, EventStatus.Rejected, rejectReason.trim());
      setShowRejectModal(false);
      Alert.alert("Success", "Event has been rejected.");
      goBack("/events.view");
    } catch (error) {
      Alert.alert("Error", "Could not reject event.");
    } finally {
      setBusyStatusUpdate(false);
    }
  }


  async function onInterested() {
    if (!event) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const previousStatus = status;
    const next: AttendanceStatus = status === "interested" ? "none" : "interested";
    
    if (previousStatus === "going") {
      setParticipantsCount(prev => Math.max(0, (prev ?? 0) - 1));
    }

    setStatus(next);

    try {
      await updateEventAttendance(event.id, next);
      if (previousStatus === "going" && Platform.OS !== "web") {
        await removeEventFromCalendar(event);
      }
    } catch (error) {
      console.error("Error updating attendance status:", error);
      setStatus(previousStatus);

      if (previousStatus === "going") {
        setParticipantsCount(prev =>(prev ?? 0) + 1);
      }

      Alert.alert("Error", "Could not save preference.");
    }
  }

  async function onGoing() {
    if (!event) return;
    if (isFull && status !== "going") return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const previousStatus = status;
    const next: AttendanceStatus = status === "going" ? "none" : "going";
    
    if (next === "going" && previousStatus !== "going") {
      setParticipantsCount(prev => (prev ?? 0) + 1);
    } 
    else if (previousStatus === "going" && next === "none") {
      setParticipantsCount(prev => Math.max(0, (prev ?? 0) - 1));
    }

    setStatus(next);
    try {
      await updateEventAttendance(event.id, next);
      if (Platform.OS !== "web") {
        if (next === "going") {
          addEventToCalendar(event);
        } else if (previousStatus === "going") {
          await removeEventFromCalendar(event);
        }
      }
    } catch (error) {
      console.error("Error updating attendance status:", error);
      setStatus(previousStatus);

      if (next === "going" && previousStatus !== "going") {
        setParticipantsCount(prev => Math.max(0, (prev ?? 0) - 1));
      } else if (previousStatus === "going" && next === "none") {
        setParticipantsCount(prev => (prev ?? 0) + 1);
      }

      Alert.alert("Error", "Could not save preference.");
    }
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
      router.replace("/my.events");
    } catch (error) {
      alert("You don't have permission to delete this event or an error occurred.");
    } finally {
      setBusyDelete(false);
    }
  }

  async function submitReview() {
    if (!event) return;
    if (reviewRating === 0) {
      Alert.alert("Rating required", "Please select a star rating before submitting.");
      return;
    }
    try {
      setBusyReview(true);
      await createReview(event.id, {
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
      setHasReviewed(true);
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment("");
      Alert.alert("Thank you!", "Your review has been submitted.");
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Could not submit review. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setBusyReview(false);
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
        <Pressable onPress={() => goBack("/events.view")} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
  <View style={styles.page}>
    <View style={styles.header}>
      <Pressable
        onPress={() => goBack("/events.view")}
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3F5E95"]} tintColor="#3F5E95" />}
    >
      {(isMine) && (
        <View style={styles.statusBadgeWrap}>
          {renderStatusBadge(event.status)}
        </View>
      )}
      <Text style={[styles.title, { paddingTop: isMine ? 8 : 12 }]}>{event.title}</Text>
      <View style={styles.categoryPill}>
        <Text style={styles.categoryText}>{categoryLabel(event.category)}</Text>
      </View>

      {isMine && event.status === EventStatus.Rejected && event.adminNotes && (
        <View style={styles.adminNoteBox}>
          <FontAwesome name="exclamation-circle" size={18} color="#DC2626" />
          <View style={styles.adminNoteContent}>
            <Text style={styles.adminNoteTitle}>
              Admin Note (Action Required)
            </Text>
            <Text style={styles.adminNoteText}>
              {event.adminNotes}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>
        {event.description?.trim() ? event.description : "-"}
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
            <Text style={styles.infoValue}>{displayLocationName}</Text>
            {!!event.address && (
              <Text style={styles.infoSubValue}>{event.address}</Text>
            )}
            {distanceText && (
              <Text style={styles.infoSubValue}>{distanceText}</Text>
            )}
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

      {!isMine && event.createdById && (
        <>
          <Text style={styles.sectionTitle}>Organizer</Text>
          <Pressable
            style={styles.organizerCard}
            onPress={() => router.push({ pathname: '/organizer.profile', params: { organizerId: event.createdById } })}
          >
            <View style={styles.organizerAvatar}>
              <FontAwesome name="user" size={16} color="#3F5E95" />
            </View>
            <View style={styles.adminNoteContent}>
              <Text style={styles.organizerCardName}>
                {event.creatorName ?? 'View organizer profile'}
              </Text>
              <Text style={styles.organizerCardSubText}>
                Tap to see reviews
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color="#8B93A7" />
          </Pressable>
        </>
      )}

       {isAdmin && event.status === EventStatus.Pending && (
         <>
         <Text style={styles.sectionTitle}>Moderation Controls</Text>
         <View style={styles.actionsRow}>
           <Pressable
             style={[styles.primaryBtn, styles.approveBtnBg]}
             onPress={handleApprove}
             disabled={busyStatusUpdate}
           >
             <FontAwesome name="check" size={14} color="#FFFFFF" />
             <Text style={styles.primaryBtnText}>{busyStatusUpdate ? "Working..." : "Approve"}</Text>
           </Pressable>

           <Pressable
             style={styles.dangerBtn} 
             onPress={() => setShowRejectModal(true)}
             disabled={busyStatusUpdate}
           >
             <FontAwesome name="times" size={14} color="#8E1B1B" />
             <Text style={styles.dangerBtnText}>Reject</Text>
           </Pressable>
         </View>
       </>
      )}

      {(!isAdmin || event.status !== EventStatus.Pending) && (
        isMine ? (
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
      ) : isPastEvent ? (
          <View style={styles.pastEventWrap}>
            <Text style={styles.pastEventText}>
              This event has already taken place.
            </Text>
            {canReview && !hasReviewed && (
              <Pressable
                style={[styles.primaryBtn, styles.leaveReviewBtn]}
                onPress={() => setShowReviewModal(true)}
              >
                <FontAwesome name="star" size={14} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Leave a Review</Text>
              </Pressable>
            )}
            {canReview && hasReviewed && (
              <View style={styles.reviewedRow}>
                <FontAwesome name="check-circle" size={16} color="#059669" />
                <Text style={styles.reviewedText}>You reviewed this event</Text>
              </View>
            )}
          </View>
        ):(
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
            <FontAwesome name={status === "going" ? "check" : "plus"} size={14} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>
              {isFull ? "Full" : status === "going" ? "Going" : "Attend"}
            </Text>
          </Pressable>
        </View>
      ))}
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

      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)} 
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Event</Text>
            <Text style={styles.modalText}>
              Please provide a reason. The creator will see this note.
            </Text>

            <TextInput
              style={styles.rejectInput}
              placeholder="e.g. Please provide a more detailed address."
              multiline
              value={rejectReason}
              onChangeText={setRejectReason}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => setShowRejectModal(false)}
                disabled={busyStatusUpdate}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.dangerBtn, busyStatusUpdate && styles.btnDisabled]}
                onPress={handleReject}
                disabled={busyStatusUpdate}
              >
              <FontAwesome name="times" size={14} color="#8E1B1B" />
              <Text style={styles.dangerBtnText}>
                {busyStatusUpdate ? "Rejecting..." : "Confirm Reject"}
              </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, styles.reviewModalContent]}>
            <Text style={styles.modalTitle}>Leave a Review</Text>
            <Text style={[styles.modalText, styles.reviewModalText]}>
              How was your experience at this event?
            </Text>

            <View style={styles.reviewStarRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setReviewRating(star)} hitSlop={6}>
                  <FontAwesome
                    name={star <= reviewRating ? "star" : "star-o"}
                    size={32}
                    color={star <= reviewRating ? "#F59E0B" : "#D1D5DB"}
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.reviewCommentInput}
              placeholder="Share your experience (optional)"
              multiline
              value={reviewComment}
              onChangeText={setReviewComment}
              maxLength={1000}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => {
                  setShowReviewModal(false);
                  setReviewRating(0);
                  setReviewComment("");
                }}
                disabled={busyReview}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryBtn, styles.reviewSubmitBtn, busyReview && styles.btnDisabled]}
                onPress={submitReview}
                disabled={busyReview}
              >
                <FontAwesome name="check" size={14} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>{busyReview ? "Submitting..." : "Submit"}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

  </View>
);}
