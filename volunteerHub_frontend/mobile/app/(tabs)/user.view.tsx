import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { getEventById, deleteEvent, updateEventAttendance, getEventParticipantsCount, getUserEventStatus } from "@/src/api/event.api";
import { getAuth } from "@/src/store/auth.store"; 
import { EVENT_CATEGORIES, EventStatus, type EventResponse } from "@/src/types/event";
import { styles } from "@/src/styles/event.view.styles";
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { calculateDistance, formatDistance } from "@/src/utils/location.utils";
import { setEventStatus } from "@/src/api/admin.api";
import { UserProfile } from "@/src/types/user";
import { deleteUser, getUserById } from "@/src/api/user.api";



export default function UserDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const auth = getAuth();
  const myUserId = auth?.userId ?? null;
  const isAdmin = auth?.roles?.includes("Admin") ?? auth?.roles?.includes("Admin") ?? false;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [busyDelete, setBusyDelete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busyStatusUpdate, setBusyStatusUpdate] = useState(false);



  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [data] = await Promise.all([
        getUserById(String(id))]);
      setUser(data);
    } finally {
      setLoading(false);
    }
  }, [id]);
  

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function onEdit() {
    if (!user) return;
    router.push({ pathname: "/user.update", params: { id: user.id } });
  }

  function onDeleteClick() {
    if (!user) return;
    setShowDeleteModal(true);
  }

  async function executeDelete() {
    if (!user) return;
    try {
      setBusyDelete(true);
    await deleteUser(user.id);
      
      setShowDeleteModal(false);
      router.replace("/users.view");
    } catch (error) {
      alert("You don't have permission to delete this user or an error occurred.");
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

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>User not found.</Text>
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
        onPress={() => router.back()}
        hitSlop={10}
        style={styles.backBtn}
      >
        <FontAwesome name="arrow-left" size={18} color="#fff" />
      </Pressable>

      <Text style={styles.headerTitle}>User Details</Text>
      <View style={styles.rightSpacer} />
    </View>

    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.sectionTitle}>First Name</Text>
      <Text style={styles.description}>
        {user.firstName ? user.firstName : "No first name provided."}
      </Text>

      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Last Name</Text>
            <Text style={styles.infoValue}>{user.lastName ? user.lastName : "No last name provided."}</Text>
          </View>
        </View>
         <View style={styles.infoRow}>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email ? user.email : "No email provided."}</Text>
          </View>
        </View>
        </View>



      (!isAdmin) ? null : (
        <>
          <Text style={styles.sectionTitle}>Admin Controls</Text>
          <View style={styles.actionsRow}>
            <Pressable style={styles.secondaryBtn} onPress={onEdit}>
              <FontAwesome name="pencil" size={14} color="#3F5E95" />
              <Text style={styles.secondaryBtnText}>Edit User</Text>
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
      )
    </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)} 
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete User</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this user? This action cannot be undone.
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
