import { FontAwesome } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { goBack } from "@/src/utils/navigation";
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
import { getMyProfile, updateMyProfile } from "@/src/api/user.api";
import { t, useLanguage } from "@/src/i18n/index";

type FieldErrors = Partial<{
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
}>;

function formatForWebInput(d: Date) {
  if (!d || isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseWebInputToDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export default function UpdateMyProfileScreen() {
  const router = useRouter();
  useLanguage();

  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
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
      let mounted = true;

      (async () => {
        try {
          const user = await getMyProfile();
          if (!mounted) return;

          setFirstName(user.firstName ?? "");
          setLastName(user.lastName ?? "");

          const d = new Date(user.dateOfBirth ?? "");
          setDateOfBirth(isNaN(d.getTime()) ? new Date() : d);
        } catch {
          setErrorMsg(t("profileUpdate.failedToLoad"));
        }
      })();

      return () => {
        mounted = false;
      };
    }, [])
  );

  function validate(): FieldErrors {
    const u: FieldErrors = {};

    const fn = FirstName.trim();
    const ln = LastName.trim();

    if (!fn) u.FirstName = t("profileUpdate.errors.firstNameRequired");
    else if (fn.length > 100) u.FirstName = t("profileUpdate.errors.firstNameTooLong");

    if (!ln) u.LastName = t("profileUpdate.errors.lastNameRequired");
    else if (ln.length > 100) u.LastName = t("profileUpdate.errors.lastNameTooLong");

    if (!DateOfBirth || isNaN(DateOfBirth.getTime()))
      u.DateOfBirth = t("profileUpdate.errors.dateOfBirthRequired");
    else if (DateOfBirth.getTime() > Date.now())
      u.DateOfBirth = t("profileUpdate.errors.dateOfBirthFuture");

    return u;
  }

  function openPicker() {
    if (submitting) return;

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: DateOfBirth,
        mode: "date",
        onChange: (_e, selectedDate) => {
          if (selectedDate) {
            setDateOfBirth(selectedDate);
            clearError("DateOfBirth");
          }
        },
      });
    } else {
      setShowPickerIOS(true);
    }
  }

  async function onSave() {
    if (submitting) return;

    setErrorMsg(null);
    const v = validate();
    setErrors(v);

    if (Object.values(v).some(Boolean)) return;

    setSubmitting(true);

    try {
      await updateMyProfile({
        firstName: FirstName.trim(),
        lastName: LastName.trim(),
        dateOfBirth: formatForWebInput(DateOfBirth),
      });

      goBack("/profile");
    } catch (e) {
      const err = toAppError(e);
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack("/profile")} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color="#fff" />
        </Pressable>

        <Text style={styles.headerTitle}>{t("profileUpdate.title")}</Text>
        <View style={styles.rightSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.label}>{t("profileUpdate.firstName")}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={FirstName}
                onChangeText={(val) => {
                  setFirstName(val);
                  clearError("FirstName");
                }}
                placeholder={t("profileUpdate.firstName")}
                style={styles.input}
                editable={!submitting}
              />
            </View>

            <Text style={[styles.label, styles.labelSpaced]}>{t("profileUpdate.lastName")}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={LastName}
                onChangeText={(val) => {
                  setLastName(val);
                  clearError("LastName");
                }}
                placeholder={t("profileUpdate.lastName")}
                style={styles.input}
                editable={!submitting}
              />
            </View>

            <Text style={[styles.label, styles.labelSpaced]}>{t("profileUpdate.dateOfBirth")}</Text>
            <View style={styles.inputWrap}>
              {Platform.OS === "web" ? (
                <input
                  type="date"
                  value={formatForWebInput(DateOfBirth)}
                  onChange={(e: any) => {
                    const d = parseWebInputToDate(e.target.value);
                    if (d) setDateOfBirth(d);
                  }}
                  disabled={submitting}
                  style={
                    {
                      height: 54,
                      paddingLeft: 16,
                      paddingRight: 16,
                      fontSize: 15,
                      border: "none",
                      width: "100%",
                      boxSizing: "border-box",
                      background: "transparent",
                      color: "#1E2A3B",
                    } as any
                  }
                />
              ) : (
                <Pressable style={styles.pressableInput} onPress={openPicker}>
                  <Text style={styles.valueText}>
                    {DateOfBirth.toLocaleDateString()}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {(errorMsg || Object.values(errors).some(Boolean)) && (
            <View style={styles.errorContainer}>
              {errorMsg && (
                <Text style={styles.errorMain}>{errorMsg}</Text>
              )}
              {Object.entries(errors)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <Text key={k} style={styles.errorField}>
                    • {v}
                  </Text>
                ))}
            </View>
          )}

          <Pressable
            disabled={submitting}
            style={[
              styles.primaryBtn,
              submitting && styles.primaryBtnDisabled,
              styles.primaryBtnTopMargin,
            ]}
            onPress={onSave}
          >
            <Text style={styles.primaryBtnText}>
              {submitting ? t("profileUpdate.saving") : t("profileUpdate.save")}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

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
                {t("common.done")}
              </Text>

              <DateTimePicker
                value={DateOfBirth}
                mode="date"
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
