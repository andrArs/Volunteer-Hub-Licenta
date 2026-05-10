import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { goBack } from "@/src/utils/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

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
import { t, useLanguage } from "@/src/i18n/index";

type AttendanceStatus = "none" | "interested" | "going" | "attended";

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

  return `${dd}-${mm}-${yyyy} ${t("eventView.formatAt")} ${hh}:${mi}`;
}

function renderStatusBadge(rawStatus: EventStatus | string | number | undefined) {
  if (rawStatus === undefined || rawStatus === null) return null;
  const status = Number(rawStatus);

  let bgColor = "#E5E7EB";
  let textColor = "#374151";
  let label = t("myEvents.statusUnknown");

  if (status === EventStatus.Pending) {
    bgColor = "#FEF3C7";
    textColor = "#D97706";
    label = t("myEvents.statusPending");
  } else if (status === EventStatus.Approved) {
    bgColor = "#D1FAE5";
    textColor = "#059669";
    label = t("myEvents.statusApproved");
  } else if (status === EventStatus.Rejected) {
    bgColor = "#FEE2E2";
    textColor = "#DC2626";
    label = t("myEvents.statusRejected");
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
  useLanguage();

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
  const [showQRModal, setShowQRModal] = useState(false);

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
      } catch {
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
    if (!event?.endDateTime) return false;
    return new Date(event.endDateTime).getTime() < new Date().getTime();
  }, [event?.endDateTime]);

  const isEventActive = useMemo(() => {
    if (!event?.startDateTime || !event?.endDateTime) return false;
    const now = new Date();
    return new Date(event.startDateTime) <= now && now <= new Date(event.endDateTime);
  }, [event?.startDateTime, event?.endDateTime]);

  const isEventEnded = useMemo(() => {
    if (!event?.endDateTime) return false;
    return new Date(event.endDateTime).getTime() < new Date().getTime();
  }, [event?.endDateTime]);

  const canReview = isEventEnded && (status === "going" || status === "attended") && !isMine && !!myUserId;

  async function handleApprove() {
    if (!event) return;
    try {
      setBusyStatusUpdate(true);
      await setEventStatus(event.id, EventStatus.Approved, "");
      Alert.alert(t("common.success"), t("eventView.approvedSuccess"));
      goBack("/events.view");
    } catch (error) {
      Alert.alert(t("common.error"), t("eventView.approveError"));
    } finally {
      setBusyStatusUpdate(false);
    }
  }

  async function handleReject() {
    if (!event || !rejectReason.trim()) {
      Alert.alert(t("eventView.required"), t("eventView.rejectRequired"));
      return;
    }
    try {
      setBusyStatusUpdate(true);
      await setEventStatus(event.id, EventStatus.Rejected, rejectReason.trim());
      setShowRejectModal(false);
      Alert.alert(t("common.success"), t("eventView.rejectSuccess"));
      goBack("/events.view");
    } catch (error) {
      Alert.alert(t("common.error"), t("eventView.rejectError"));
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
    } catch {
      setStatus(previousStatus);

      if (previousStatus === "going") {
        setParticipantsCount(prev =>(prev ?? 0) + 1);
      }

      Alert.alert(t("common.error"), t("eventView.saveError"));
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
    } catch {
      setStatus(previousStatus);

      if (next === "going" && previousStatus !== "going") {
        setParticipantsCount(prev => Math.max(0, (prev ?? 0) - 1));
      } else if (previousStatus === "going" && next === "none") {
        setParticipantsCount(prev => (prev ?? 0) + 1);
      }

      Alert.alert(t("common.error"), t("eventView.saveError"));
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
      Alert.alert(t("common.error"), t("eventView.deleteError"));
    } finally {
      setBusyDelete(false);
    }
  }

  async function submitReview() {
    if (!event) return;
    if (reviewRating === 0) {
      Alert.alert(t("common.error"), t("eventView.ratingRequired"));
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
      Alert.alert(t("eventView.reviewThankYou"), t("eventView.reviewSuccess"));
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? t("eventView.reviewError");
      Alert.alert(t("common.error"), msg);
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
        <Text style={styles.errorText}>{t("eventView.notFound")}</Text>
        <Pressable onPress={() => goBack("/events.view")} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t("common.goBack")}</Text>
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

      <Text style={styles.headerTitle}>{t("eventView.title")}</Text>
      <View style={styles.rightSpacer} />
    </View>

    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3F5E95"]} tintColor="#3F5E95" />}
    >
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={{ height: 220, marginHorizontal: -16, marginBottom: 16, marginTop: -4 }} resizeMode="cover" />
      ) : null}

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
              {t("eventView.adminNoteTitle")}
            </Text>
            <Text style={styles.adminNoteText}>
              {event.adminNotes}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>{t("eventView.sectionDescription")}</Text>
      <Text style={styles.description}>
        {event.description?.trim() ? event.description : "-"}
      </Text>

      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <FontAwesome name="calendar" size={16} color="#3F5E95" />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>{t("eventView.labelDateTime")}</Text>
            <Text style={styles.infoValue}>{formatStart(event.startDateTime)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <FontAwesome name="map-marker" size={16} color="#3F5E95" />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>{t("eventView.labelLocation")}</Text>
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
              <Text style={styles.infoLabel}>{t("eventView.labelParticipants")}</Text>
              <Text style={styles.infoValue}>
                {participantsCount != null && capacity != null
                  ? t("eventView.peopleGoingOf", { count: participantsCount, capacity })
                  : participantsCount != null
                  ? t("eventView.peopleGoing", { count: participantsCount })
                  : t("eventView.peopleGoingOf", { count: 0, capacity })}
              </Text>
              {isFull ? (
                <Text style={styles.fullText}>{t("eventView.eventFull")}</Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>

      {!isMine && event.createdById && (
        <>
          <Text style={styles.sectionTitle}>{t("eventView.sectionOrganizer")}</Text>
          <Pressable
            style={styles.organizerCard}
            onPress={() => router.push({ pathname: '/organizer.profile', params: { organizerId: event.createdById } })}
          >
            <View style={styles.organizerAvatar}>
              <FontAwesome name="user" size={16} color="#3F5E95" />
            </View>
            <View style={styles.adminNoteContent}>
              <Text style={styles.organizerCardName}>
                {event.creatorName ?? t("eventView.viewOrganizerFallback")}
              </Text>
              <Text style={styles.organizerCardSubText}>
                {t("eventView.tapToSeeReviews")}
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color="#8B93A7" />
          </Pressable>
        </>
      )}

       {isAdmin && event.status === EventStatus.Pending && (
         <>
         <Text style={styles.sectionTitle}>{t("eventView.sectionModerationControls")}</Text>
         <View style={styles.actionsRow}>
           <Pressable
             style={[styles.primaryBtn, styles.approveBtnBg]}
             onPress={handleApprove}
             disabled={busyStatusUpdate}
           >
             <FontAwesome name="check" size={14} color="#FFFFFF" />
             <Text style={styles.primaryBtnText}>{busyStatusUpdate ? t("eventView.working") : t("eventView.approve")}</Text>
           </Pressable>

           <Pressable
             style={styles.dangerBtn}
             onPress={() => setShowRejectModal(true)}
             disabled={busyStatusUpdate}
           >
             <FontAwesome name="times" size={14} color="#8E1B1B" />
             <Text style={styles.dangerBtnText}>{t("eventView.reject")}</Text>
           </Pressable>
         </View>
       </>
      )}

      {(!isAdmin || event.status !== EventStatus.Pending) && (
        isMine ? (
        <>
          <Text style={styles.sectionTitle}>{t("eventView.sectionAdminControls")}</Text>

          <View style={styles.actionsRow}>
            <Pressable style={styles.secondaryBtn} onPress={onEdit}>
              <FontAwesome name="pencil" size={14} color="#3F5E95" />
              <Text style={styles.secondaryBtnText}>{t("eventView.editEvent")}</Text>
            </Pressable>

            <Pressable
              style={[styles.dangerBtn]}
              onPress={onDeleteClick}
            >
              <FontAwesome name="trash" size={14} color="#8E1B1B" />
              <Text style={styles.dangerBtnText}>
                {busyDelete ? t("eventView.deleting") : t("common.delete")}
              </Text>
            </Pressable>
          </View>

          {event.checkInToken ? (
            <Pressable
              style={[styles.actionsRow, { marginTop: 8 }]}
              onPress={() => setShowQRModal(true)}
            >
              <View style={[styles.secondaryBtn, { flex: 1 }]}>
                <FontAwesome name="qrcode" size={14} color="#3F5E95" />
                <Text style={styles.secondaryBtnText}>{t("eventView.showQR")}</Text>
              </View>
            </Pressable>
          ) : null}
        </>
      ) : isPastEvent ? (
          <View style={styles.pastEventWrap}>
            <Text style={styles.pastEventText}>
              {t("eventView.pastEvent")}
            </Text>
            {canReview && !hasReviewed && (
              <Pressable
                style={[styles.primaryBtn, styles.leaveReviewBtn]}
                onPress={() => setShowReviewModal(true)}
              >
                <FontAwesome name="star" size={14} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>{t("eventView.leaveReview")}</Text>
              </Pressable>
            )}
            {canReview && hasReviewed && (
              <View style={styles.reviewedRow}>
                <FontAwesome name="check-circle" size={16} color="#059669" />
                <Text style={styles.reviewedText}>{t("eventView.reviewedEvent")}</Text>
              </View>
            )}
          </View>
        ):(
        <>
          {status === "attended" ? (
            <View style={styles.reviewedRow}>
              <FontAwesome name="check-circle" size={18} color="#059669" />
              <Text style={styles.reviewedText}>{t("eventView.checkedIn")}</Text>
            </View>
          ) : (
            <>
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
                    {t("eventView.interested")}
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
                    {isFull ? t("eventView.full") : status === "going" ? t("eventView.going") : t("eventView.attend")}
                  </Text>
                </Pressable>
              </View>

              {status === "going" && isEventActive && (
                <Pressable
                  style={[styles.actionsRow, { marginTop: 8 }]}
                  onPress={() => router.push("/checkin.scanner")}
                >
                  <View style={[styles.primaryBtn, { flex: 1, backgroundColor: "#059669" }]}>
                    <FontAwesome name="qrcode" size={14} color="#fff" />
                    <Text style={styles.primaryBtnText}>{t("eventView.checkIn")}</Text>
                  </View>
                </Pressable>
              )}
            </>
          )}
        </>
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
            <Text style={styles.modalTitle}>{t("eventView.deleteModalTitle")}</Text>
            <Text style={styles.modalText}>
              {t("eventView.deleteModalText")}
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => setShowDeleteModal(false)}
                disabled={busyDelete}
              >
                <Text style={styles.secondaryBtnText}>{t("common.cancel")}</Text>
              </Pressable>

              <Pressable
                style={[styles.dangerBtn, busyDelete && styles.btnDisabled]}
                onPress={executeDelete}
                disabled={busyDelete}
              >
              <FontAwesome name="trash" size={14} color="#8E1B1B" />
              <Text style={styles.dangerBtnText}>
                {busyDelete ? t("eventView.deleting") : t("common.delete")}
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
            <Text style={styles.modalTitle}>{t("eventView.rejectModalTitle")}</Text>
            <Text style={styles.modalText}>
              {t("eventView.rejectModalText")}
            </Text>

            <TextInput
              style={styles.rejectInput}
              placeholder={t("eventView.rejectPlaceholder")}
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
                <Text style={styles.secondaryBtnText}>{t("common.cancel")}</Text>
              </Pressable>

              <Pressable
                style={[styles.dangerBtn, busyStatusUpdate && styles.btnDisabled]}
                onPress={handleReject}
                disabled={busyStatusUpdate}
              >
              <FontAwesome name="times" size={14} color="#8E1B1B" />
              <Text style={styles.dangerBtnText}>
                {busyStatusUpdate ? t("eventView.rejecting") : t("eventView.confirmReject")}
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
            <Text style={styles.modalTitle}>{t("eventView.reviewModalTitle")}</Text>
            <Text style={[styles.modalText, styles.reviewModalText]}>
              {t("eventView.reviewModalText")}
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
              placeholder={t("eventView.reviewPlaceholder")}
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
                <Text style={styles.secondaryBtnText}>{t("common.cancel")}</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryBtn, styles.reviewSubmitBtn, busyReview && styles.btnDisabled]}
                onPress={submitReview}
                disabled={busyReview}
              >
                <FontAwesome name="check" size={14} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>{busyReview ? t("common.submitting") : t("common.submit")}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowQRModal(false)}>
          <Pressable onPress={() => {}}>
            <View style={[styles.modalContent, { alignItems: "center", paddingVertical: 32 }]}>
              <Text style={[styles.modalTitle, { textAlign: "center" }]}>{t("eventView.qrModalTitle")}</Text>
              <Text style={[styles.modalText, { textAlign: "center", marginBottom: 24 }]}>{t("eventView.qrModalSubtitle")}</Text>
              {event?.checkInToken ? (
                <QRCode value={event.checkInToken} size={200} />
              ) : null}
              <Pressable style={{ marginTop: 24 }} onPress={() => setShowQRModal(false)}>
                <Text style={{ color: "#3F5E95", fontWeight: "800", fontSize: 14 }}>{t("common.close")}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

  </View>
);}
