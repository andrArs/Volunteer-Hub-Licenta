import { register } from "@/src/api/auth.api";
import { toAppError } from "@/src/api/errors";
import { setAuth } from "@/src/store/auth.store";
import { getToken } from "@/src/platform/storage";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker, {
    DateTimePickerAndroid,
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useMemo, useState, useEffect } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { styles } from "../../src/styles/auth.styles";

type FieldErrors = Partial<{
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  password: string;
  general: string;
}>;

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  
  const [dateOfBirth, setDateOfBirth] = useState(""); 
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false); // iOS modal only

  const [hidePassword, setHidePassword] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getToken();
        if (token) {
          router.replace("/(tabs)");
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      }
    }

    checkAuth();
  }, [router]);

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 0 &&
      password.length > 0 &&
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      dateOfBirth.trim().length > 0 &&
      !submitting
    );
  }, [firstName, lastName, dateOfBirth, email, password, submitting]);

  function formatDob(d: Date) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  function formatDobISO(d: Date) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`; 
  }

  function parseISODate(s: string) {
   
    const [y, m, d] = s.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function onDobSelected(d: Date) {
    setDobDate(d);
    setDateOfBirth(formatDob(d)); 
    setErrors((p) => ({ ...p, dateOfBirth: undefined, general: undefined }));
  }

  function onDobChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    if (!selectedDate) return;
    onDobSelected(selectedDate);
  }

  function openDobPicker() {
    if (submitting) return;

    const initial = dobDate ?? new Date(2000, 0, 1);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: initial,
        mode: "date",
        is24Hour: true,
        maximumDate: new Date(),
        onChange: onDobChange,
      });
      return;
    }

    if (Platform.OS === "ios") {
      setShowDobPicker(true);
    }
  }

  function splitServerErrors(msg: string): string[] {
  return msg
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

  function validate(): FieldErrors {
    const e: FieldErrors = {};

    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim()) e.lastName = "Last name is required.";
    if (!dateOfBirth.trim()) e.dateOfBirth = "Date of birth is required.";

    const emailClean = email.trim();
    if (!emailClean) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      e.email = "Email format is invalid.";
    }

    if (!password) e.password = "Password is required.";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters.";

    return e;
  }

  async function onRegister() {
    if (submitting) return;

    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    setErrors((p) => ({ ...p, general: undefined }));

    try {
      const [d, m, y] = dateOfBirth.trim().split("-").map(Number);
      const dobDate = new Date(y, m - 1, d);
      const dobISO = formatDobISO(dobDate); 

      const response = await register({
        FirstName: firstName.trim(),
        LastName: lastName.trim(),
        DateOfBirth: dobISO, 
        Email: email.trim(),
        Password: password,
      });

      await setAuth(response);
      router.replace("/(tabs)");
    } catch (err) {
      const anyErr: any = err;
      const data = anyErr?.response?.data;
      const serverMsg: string | undefined =
        data?.error ??
        data?.message ??
        anyErr?.message ??
        toAppError(err).message;

      if (serverMsg) {
        if (/email already in use/i.test(serverMsg)) {
          setErrors((p) => ({ ...p, email: serverMsg, general: undefined }));
        } else if (/password/i.test(serverMsg)) {
          const parts = splitServerErrors(serverMsg);
          setErrors((p) => ({
            ...p,
            password: parts.join("\n"), 
            general: undefined,
          }));
        } else {
          setErrors((p) => ({ ...p, general: serverMsg }));
        }
      } else {
        setErrors((p) => ({ ...p, general: "Registration failed." }));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Volunteer Hub</Text>

        <View style={styles.card}>
          {/* First Name */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <FontAwesome name="user" size={16} style={styles.leftIcon} />
            <TextInput
              value={firstName}
              onChangeText={(t) => {
                setFirstName(t);
                setErrors((p) => ({
                  ...p,
                  firstName: undefined,
                  general: undefined,
                }));
              }}
              placeholder="First Name"
              autoCapitalize="words"
              keyboardType="default"
              textContentType="givenName"
              style={styles.input}
              placeholderTextColor="#8B93A7"
              editable={!submitting}
            />
          </View>
          {errors.firstName ? (
            <Text style={styles.fieldError}>{errors.firstName}</Text>
          ) : null}

          {/* Last Name */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <FontAwesome name="user" size={16} style={styles.leftIcon} />
            <TextInput
              value={lastName}
              onChangeText={(t) => {
                setLastName(t);
                setErrors((p) => ({
                  ...p,
                  lastName: undefined,
                  general: undefined,
                }));
              }}
              placeholder="Last Name"
              autoCapitalize="words"
              keyboardType="default"
              textContentType="familyName"
              style={styles.input}
              placeholderTextColor="#8B93A7"
              editable={!submitting}
            />
          </View>
          {errors.lastName ? (
            <Text style={styles.fieldError}>{errors.lastName}</Text>
          ) : null}

          {/* Date of Birth */}
          {Platform.OS === "web" ? (
            <>
              <View style={[styles.inputWrap, { marginTop: 12 }]}>
                <FontAwesome
                  name="calendar"
                  size={16}
                  style={styles.leftIcon}
                />
                <input
                  type="date"
                  value={dobDate ? formatDobISO(dobDate) : ""}
                  onChange={(e: any) => {
                    const t = e.target.value;
                    const d = parseISODate(t);
                    if (d) onDobSelected(d);
                    else
                      setErrors((p) => ({
                        ...p,
                        dateOfBirth: "Please choose a valid date.",
                      }));
                  }}
                  disabled={submitting}
                  max={formatDobISO(new Date())}
                  style={
                    {
                      height: 46,
                      paddingLeft: 38,
                      paddingRight: 12,
                      fontSize: 15,
                      color: "#1E2A3B",
                      borderRadius: 8,
                      border: "none",
                      width: "100%",
                      boxSizing: "border-box",
                    } as any
                  }
                />
              </View>
              {errors.dateOfBirth ? (
                <Text style={styles.fieldError}>{errors.dateOfBirth}</Text>
              ) : null}
            </>
          ) : (
            <>
              <View style={[styles.inputWrap, { marginTop: 12 }]}>
                <FontAwesome
                  name="calendar"
                  size={16}
                  style={styles.leftIcon}
                />
                <Pressable
                  onPress={openDobPicker}
                  disabled={submitting}
                  style={{ height: 46, justifyContent: "center" }}
                >
                  <Text
                    style={[
                      styles.input,
                      { color: dateOfBirth ? "#1E2A3B" : "#8B93A7" },
                    ]}
                  >
                    {dateOfBirth ? dateOfBirth : "Date of Birth"}
                  </Text>
                </Pressable>
              </View>
              {errors.dateOfBirth ? (
                <Text style={styles.fieldError}>{errors.dateOfBirth}</Text>
              ) : null}

              {/* iOS modal picker */}
              {Platform.OS === "ios" && (
                <Modal visible={showDobPicker} transparent animationType="fade">
                  <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowDobPicker(false)}
                  >
                    <Pressable style={styles.modalSheet} onPress={() => {}}>
                      <View style={styles.modalHeader}>
                        <Pressable onPress={() => setShowDobPicker(false)}>
                          <Text style={styles.modalBtn}>Cancel</Text>
                        </Pressable>
                        <Pressable onPress={() => setShowDobPicker(false)}>
                          <Text style={styles.modalBtn}>Done</Text>
                        </Pressable>
                      </View>

                      <DateTimePicker
                        value={dobDate ?? new Date(2000, 0, 1)}
                        mode="date"
                        display="spinner"
                        maximumDate={new Date()}
                        onChange={onDobChange}
                      />
                    </Pressable>
                  </Pressable>
                </Modal>
              )}
            </>
          )}

          {/* Email */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <FontAwesome name="envelope" size={16} style={styles.leftIcon} />
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErrors((p) => ({
                  ...p,
                  email: undefined,
                  general: undefined,
                }));
              }}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.input}
              placeholderTextColor="#8B93A7"
              editable={!submitting}
            />
          </View>
          {errors.email ? (
            <Text style={styles.fieldError}>{errors.email}</Text>
          ) : null}

          {/* Password */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <FontAwesome name="lock" size={18} style={styles.leftIcon} />
            <TextInput
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrors((p) => ({
                  ...p,
                  password: undefined,
                  general: undefined,
                }));
              }}
              placeholder="Password"
              secureTextEntry={hidePassword}
              textContentType="password"
              style={[styles.input, { paddingRight: 44 }]}
              placeholderTextColor="#8B93A7"
              editable={!submitting}
            />

            <Pressable
              onPress={() => setHidePassword((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={10}
              disabled={submitting}
            >
              <FontAwesome
                name={hidePassword ? "eye" : "eye-slash"}
                size={18}
                color="#6F7A93"
              />
            </Pressable>
          </View>
          {errors.password ? (
            <Text style={styles.fieldError}>{errors.password}</Text>
          ) : null}

          {errors.general ? (
            <Text style={styles.errorText}>{errors.general}</Text>
          ) : null}
        </View>

        <Pressable
          disabled={!canSubmit}
          style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
          onPress={onRegister}
        >
          <Text style={styles.primaryBtnText}>
            {submitting ? "Signing Up..." : "Sign up"}
          </Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            disabled={submitting}
          >
            <Text style={styles.footerLink}> Sign in now!</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

