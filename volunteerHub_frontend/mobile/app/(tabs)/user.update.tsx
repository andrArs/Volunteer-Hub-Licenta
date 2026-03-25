import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCallback, useState } from "react";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

import { styles } from "@/src/styles/event.style";
import { toAppError } from "@/src/api/errors";
import { getUserById, updateUser } from "@/src/api/user.api";

type FieldErrors = Partial<{
  FirstName: string;
  LastName: string;
  Email: string;
  DateOfBirth: string;
}>;

function formatForWebInput(d: Date) {
  if (!d || isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseWebInputToDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export default function UpdateUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [DateOfBirth, setDateOfBirth] = useState<Date>(new Date());

  const [showPickerIOS, setShowPickerIOS] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  function clearError(k: keyof FieldErrors) {
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  useFocusEffect(
    useCallback(() => {
      setErrors({});
      setErrorMsg(null);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (!id) return;

      let mounted = true;

      (async () => {
        try {
          const user = await getUserById(String(id));
          if (!mounted) return;

          setFirstName(user.firstName ?? "");
          setLastName(user.lastName ?? "");
          setEmail(user.email ?? "");

          const d = new Date(user.dateOfBirth ?? "");
          setDateOfBirth(isNaN(d.getTime()) ? new Date() : d);
        } catch {
          setErrorMsg("Failed to load user.");
        }
      })();

      return () => {
        mounted = false;
      };
    }, [id])
  );

  function validate(): FieldErrors {
    const u: FieldErrors = {};

    const fn = FirstName.trim();
    const ln = LastName.trim();
    const e = Email.trim();

    if (!fn) u.FirstName = "First name is required.";
    else if (fn.length > 100)
      u.FirstName = "First name must be max 100 characters.";

    if (!ln) u.LastName = "Last name is required.";
    else if (ln.length > 100)
      u.LastName = "Last name must be max 100 characters.";

    if (!e) u.Email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(e))
      u.Email = "Email is invalid.";

    if (!DateOfBirth || isNaN(DateOfBirth.getTime()))
      u.DateOfBirth = "Date of birth is required.";
    else if (DateOfBirth.getTime() > Date.now())
      u.DateOfBirth = "Date of birth cannot be in the future.";

    return u;
  }

  function mergeDateAndTime(base: Date, time: Date) {
    const d = new Date(base);
    d.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return d;
  }

  function openPicker() {
    if (submitting) return;

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: DateOfBirth,
        mode: "date",
        onChange: (_e, selectedDate) => {
          if (!selectedDate) return;

          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            onChange: (_e2, selectedTime) => {
              if (!selectedTime) return;

              const combined = mergeDateAndTime(
                selectedDate,
                selectedTime
              );
              setDateOfBirth(combined);
              clearError("DateOfBirth");
            },
          });
        },
      });
    } else {
      setShowPickerIOS(true);
    }
  }

  async function onUpdateUser() {
    if (submitting) return;

    setErrorMsg(null);
    const v = validate();
    setErrors(v);

    if (Object.values(v).some(Boolean)) return;

    setSubmitting(true);

    try {
      if (!id) return;

      await updateUser(String(id), {
        firstName: FirstName.trim(),
        lastName: LastName.trim(),
        email: Email.trim(),
        dateOfBirth: DateOfBirth.toISOString(),
      });

      router.back();
    } catch (e) {
      const err = toAppError(e);
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color="#fff" />
        </Pressable>

        <Text style={styles.headerTitle}>Update User</Text>
        <View style={styles.rightSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {/* First Name */}
            <Text style={styles.label}>First Name</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={FirstName}
                onChangeText={(t) => {
                  setFirstName(t);
                  clearError("FirstName");
                }}
                placeholder="First Name"
                style={styles.input}
                editable={!submitting}
              />
            </View>

            {/* Last Name */}
            <Text style={[styles.label, { marginTop: 12 }]}>
              Last Name
            </Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={LastName}
                onChangeText={(t) => {
                  setLastName(t);
                  clearError("LastName");
                }}
                placeholder="Last Name"
                style={styles.input}
                editable={!submitting}
              />
            </View>

            {/* Email */}
            <Text style={[styles.label, { marginTop: 12 }]}>
              Email
            </Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={Email}
                onChangeText={(t) => {
                  setEmail(t);
                  clearError("Email");
                }}
                placeholder="Email"
                keyboardType="email-address"
                style={styles.input}
                editable={!submitting}
              />
            </View>

            {/* DOB */}
            <Text style={[styles.label, { marginTop: 12 }]}>
              Date of Birth
            </Text>
            <View style={styles.inputWrap}>
              {Platform.OS === "web" ? (
                <input
                  type="datetime-local"
                  value={formatForWebInput(DateOfBirth)}
                  onChange={(e: any) => {
                    const d = parseWebInputToDate(e.target.value);
                    if (d) setDateOfBirth(d);
                  }}
                  disabled={submitting}
                  style={{
                    height: 54,
                    paddingLeft: 16,
                  }}
                />
              ) : (
                <Pressable
                  style={styles.pressableInput}
                  onPress={openPicker}
                >
                  <Text style={styles.valueText}>
                    {DateOfBirth.toLocaleString()}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* ERRORS */}
          {(errorMsg || Object.values(errors).some(Boolean)) && (
            <View style={{ alignItems: "center", marginTop: 16 }}>
              {errorMsg && (
                <Text style={{ color: "#D92D20", fontWeight: "700" }}>
                  {errorMsg}
                </Text>
              )}

              {Object.entries(errors)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <Text key={k} style={{ color: "#D92D20" }}>
                    • {v}
                  </Text>
                ))}
            </View>
          )}

          {/* BUTTON */}
          <Pressable
            disabled={submitting}
            style={[
              styles.primaryBtn,
              submitting && styles.primaryBtnDisabled,
              { marginTop: 20 },
            ]}
            onPress={onUpdateUser}
          >
            <Text style={styles.primaryBtnText}>
              {submitting ? "Updating..." : "Update User"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* iOS PICKER */}
      {Platform.OS === "ios" && showPickerIOS && (
        <Modal transparent animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowPickerIOS(false)}
          >
            <Pressable style={styles.modalSheet}>
              <Text
                style={styles.modalBtn}
                onPress={() => setShowPickerIOS(false)}
              >
                Done
              </Text>

              <DateTimePicker
                value={DateOfBirth}
                mode="datetime"
                display="spinner"
                onChange={(_, d) => d && setDateOfBirth(d)}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}