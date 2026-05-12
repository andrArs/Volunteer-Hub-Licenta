import { register } from "@/src/api/auth.api";
import { toAppError } from "@/src/api/errors";
import { setAuth } from "@/src/store/auth.store";
import { getToken } from "@/src/platform/storage";
import { GOOGLE_WEB_CLIENT_ID } from "@/src/constants/google";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker, {
    DateTimePickerAndroid,
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { type TextInput as TextInputType } from "react-native";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";

import { styles, langStyles } from "../../src/styles/auth.styles";
import { t, useLanguage } from "@/src/i18n/index";

WebBrowser.maybeCompleteAuthSession();

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
  const { locale, setLocale } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const lastNameRef = useRef<TextInputType>(null);
  const emailRef = useRef<TextInputType>(null);
  const passwordRef = useRef<TextInputType>(null);

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const [hidePassword, setHidePassword] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getToken();
        if (token) {
          router.replace("/(tabs)");
        }
      } catch {
      }
    }
    checkAuth();
  }, [router]);

  async function onGooglePress() {
    if (typeof window === "undefined") return;
    const redirectUri = window.location.origin + "/login";
    const nonce = Math.random().toString(36).slice(2, 15);
    const params = new URLSearchParams({
      client_id: GOOGLE_WEB_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "id_token",
      scope: "openid profile email",
      nonce,
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  const busy = submitting || googleSubmitting;

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 0 &&
      password.length > 0 &&
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      dateOfBirth.trim().length > 0 &&
      !busy
    );
  }, [firstName, lastName, dateOfBirth, email, password, busy]);

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
    if (busy) return;

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
    return msg.split(";").map((s) => s.trim()).filter(Boolean);
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {};

    if (!firstName.trim()) e.firstName = t("register.errors.firstNameRequired");
    if (!lastName.trim()) e.lastName = t("register.errors.lastNameRequired");
    if (!dateOfBirth.trim()) {
      e.dateOfBirth = t("register.errors.dateOfBirthRequired");
    } else if (dobDate) {
      const minDate = new Date(dobDate.getFullYear() + 16, dobDate.getMonth(), dobDate.getDate());
      if (minDate > new Date()) e.dateOfBirth = t("register.errors.tooYoung");
    }

    const emailClean = email.trim();
    if (!emailClean) e.email = t("register.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      e.email = t("register.errors.emailInvalid");
    }

    if (!password) e.password = t("register.errors.passwordRequired");
    else if (password.length < 6)
      e.password = t("register.errors.passwordTooShort");

    return e;
  }

  async function onRegister() {
    if (busy) return;

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
        setErrors((p) => ({ ...p, general: t("register.errors.registrationFailed") }));
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
      <View style={langStyles.langRow}>
        <Pressable
          onPress={() => setLocale("en")}
          style={[langStyles.langBtn, locale === "en" && langStyles.langBtnActive]}
        >
          <Text style={[langStyles.langText, locale === "en" && langStyles.langTextActive]}>EN</Text>
        </Pressable>
        <Pressable
          onPress={() => setLocale("ro")}
          style={[langStyles.langBtn, locale === "ro" && langStyles.langBtnActive]}
        >
          <Text style={[langStyles.langText, locale === "ro" && langStyles.langTextActive]}>RO</Text>
        </Pressable>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>{t("register.appName")}</Text>

        <View style={styles.card}>
          {/* First Name */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <FontAwesome name="user" size={16} style={styles.leftIcon} />
            <TextInput
              value={firstName}
              onChangeText={(val) => {
                setFirstName(val);
                setErrors((p) => ({ ...p, firstName: undefined, general: undefined }));
              }}
              placeholder={t("register.firstName")}
              autoCapitalize="words"
              keyboardType="default"
              textContentType="givenName"
              style={styles.input}
              placeholderTextColor="#8B93A7"
              editable={!busy}
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />
          </View>
          {errors.firstName ? (
            <Text style={styles.fieldError}>{errors.firstName}</Text>
          ) : null}

          {/* Last Name */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <FontAwesome name="user" size={16} style={styles.leftIcon} />
            <TextInput
              ref={lastNameRef}
              value={lastName}
              onChangeText={(val) => {
                setLastName(val);
                setErrors((p) => ({ ...p, lastName: undefined, general: undefined }));
              }}
              placeholder={t("register.lastName")}
              autoCapitalize="words"
              keyboardType="default"
              textContentType="familyName"
              style={styles.input}
              placeholderTextColor="#8B93A7"
              editable={!busy}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>
          {errors.lastName ? (
            <Text style={styles.fieldError}>{errors.lastName}</Text>
          ) : null}

          {/* Date of Birth */}
          {Platform.OS === "web" ? (
            <>
              <View style={[styles.inputWrap, { marginTop: 12 }]}>
                <FontAwesome name="calendar" size={16} style={styles.leftIcon} />
                <input
                  type="date"
                  value={dobDate ? formatDobISO(dobDate) : ""}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    const d = parseISODate(val);
                    if (d) onDobSelected(d);
                    else
                      setErrors((p) => ({
                        ...p,
                        dateOfBirth: t("register.errors.invalidDate"),
                      }));
                  }}
                  disabled={busy}
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
                <FontAwesome name="calendar" size={16} style={styles.leftIcon} />
                <Pressable
                  onPress={openDobPicker}
                  disabled={busy}
                  style={{ flex: 1, height: 46, justifyContent: "center" }}
                >
                  <Text
                    style={{
                      paddingLeft: 38,
                      paddingRight: 12,
                      fontSize: 15,
                      color: dateOfBirth ? "#1E2A3B" : "#8B93A7",
                    }}
                  >
                    {dateOfBirth ? dateOfBirth : t("register.dateOfBirth")}
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
                          <Text style={styles.modalBtn}>{t("common.cancel")}</Text>
                        </Pressable>
                        <Pressable onPress={() => setShowDobPicker(false)}>
                          <Text style={styles.modalBtn}>{t("common.done")}</Text>
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
              ref={emailRef}
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                setErrors((p) => ({ ...p, email: undefined, general: undefined }));
              }}
              placeholder={t("register.email")}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.input}
              placeholderTextColor="#8B93A7"
              editable={!busy}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>
          {errors.email ? (
            <Text style={styles.fieldError}>{errors.email}</Text>
          ) : null}

          {/* Password */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <FontAwesome name="lock" size={18} style={styles.leftIcon} />
            <TextInput
              ref={passwordRef}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                setErrors((p) => ({ ...p, password: undefined, general: undefined }));
              }}
              placeholder={t("register.password")}
              secureTextEntry={hidePassword}
              textContentType="password"
              style={[styles.input, { paddingRight: 44 }]}
              placeholderTextColor="#8B93A7"
              returnKeyType="done"
              onSubmitEditing={onRegister}
              editable={!busy}
            />

            <Pressable
              onPress={() => setHidePassword((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={10}
              disabled={busy}
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
            {submitting ? t("register.signingUp") : t("register.signUp")}
          </Text>
        </Pressable>

        {Platform.OS === "web" && (
          <>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t("register.or")}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              disabled={busy}
              style={[styles.googleBtn, busy && styles.primaryBtnDisabled]}
              onPress={onGooglePress}
            >
              <FontAwesome name="google" size={18} color="#DB4437" />
              <Text style={styles.googleBtnText}>
                {googleSubmitting ? t("register.signingUp") : t("register.continueWithGoogle")}
              </Text>
            </Pressable>
          </>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t("register.alreadyHaveAccount")}</Text>
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            disabled={busy}
          >
            <Text style={styles.footerLink}>{t("register.signInNow")}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
