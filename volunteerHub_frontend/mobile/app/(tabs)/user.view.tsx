import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { getAuth } from "@/src/store/auth.store"; 
import { styles } from "@/src/styles/user.styles";
import { UserProfile } from "@/src/types/user";
import { assignRole, deleteUser, getUserById, removeRole } from "@/src/api/user.api";

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

  async function handleToggleRole(role: string, hasRole: boolean) {
    if (!user) return;
    try {
      if (hasRole) {
        await removeRole(user.id, role);
        setUser({ ...user, roles: user.roles.filter((r) => r !== role) });
      } else {
        await assignRole(user.id, role);
        setUser({ ...user, roles: [...(user.roles || []), role] });
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not update role.");
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
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <FontAwesome name="user" size={32} color="#3F5E95" />
          </View>
          <Text style={styles.avatarName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.avatarEmail}>
            {user.email}
          </Text>
        </View>

        <View style={styles.userDetailsBox}>
          <View style={styles.userDetailRow}>
            <Text style={styles.userDetailLabel}>First Name</Text>
            <Text style={styles.userDetailValue}>{user.firstName || "."}</Text>
          </View>
          <View style={styles.userDetailRow}>
            <Text style={styles.userDetailLabel}>Last Name</Text>
            <Text style={styles.userDetailValue}>{user.lastName || "."}</Text>
          </View>
          <View style={styles.userDetailRowLast}>
            <Text style={styles.userDetailLabel}>Email</Text>
            <Text style={styles.userDetailValue}>{user.email || "."}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Manage Roles</Text>
      <View style={styles.rolesCard}>
        <View style={styles.roleRow}>
          <Text style={styles.roleLabel}>Admin Access</Text>
          <Switch
            value={user.roles?.includes('Admin')}
            onValueChange={() => handleToggleRole('Admin', user.roles?.includes('Admin') ?? false)}
            trackColor={{ false: "#E5E7EB", true: "#E5E7EB" }} 
          />
        </View>

        <View style={styles.roleRowBordered}>
          <Text style={styles.roleLabel}>Creator Access</Text>
          <Switch
            value={user.roles?.includes('Creator')}
            onValueChange={() => handleToggleRole('Creator', user.roles?.includes('Creator') ?? false)}
            trackColor={{ false: "#E5E7EB", true: "#E5E7EB" }} 
          />
        </View>
      </View>

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
