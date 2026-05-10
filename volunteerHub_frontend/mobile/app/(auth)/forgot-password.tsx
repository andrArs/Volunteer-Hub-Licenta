import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { goBack } from "@/src/utils/navigation";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { forgotPassword } from "@/src/api/auth.api";
import { toAppError } from "@/src/api/errors";
import { styles } from "@/src/styles/auth.styles";
import { t, useLanguage } from "@/src/i18n/index";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { locale } = useLanguage();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailValid = EMAIL_REGEX.test(email.trim());
  const canSubmit = emailValid && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;

    if (!emailValid) {
      setErrorMsg(t("forgotPassword.invalidEmail"));
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      router.push({ pathname: "/(auth)/reset-password", params: { email: email.trim() } });
    } catch (e) {
      const err = toAppError(e);
      if (err.message === "google_account") {
        setErrorMsg(t("forgotPassword.googleAccount"));
      } else {
        setErrorMsg(err.message);
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
        <Text style={styles.title}>{t("forgotPassword.appName")}</Text>

        <Text style={{ textAlign: "center", color: "#7E879C", fontSize: 14, marginBottom: 20 }}>
          {t("forgotPassword.instruction")}
        </Text>

        <View style={styles.card}>
          <View style={styles.inputWrap}>
            <FontAwesome name="envelope" size={16} style={styles.leftIcon} />
            <TextInput
              value={email}
              onChangeText={(val) => { setEmail(val); if (errorMsg) setErrorMsg(null); }}
              placeholder={t("forgotPassword.email")}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.input}
              placeholderTextColor="#8B93A7"
              editable={!submitting}
            />
          </View>
          {email.length > 0 && !emailValid && (
            <Text style={styles.fieldError}>{t("forgotPassword.invalidEmail")}</Text>
          )}
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>

        <Pressable
          disabled={!canSubmit}
          style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
          onPress={onSubmit}
        >
          <Text style={styles.primaryBtnText}>
            {submitting ? t("forgotPassword.sending") : t("forgotPassword.sendCode")}
          </Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Pressable onPress={() => goBack("/(auth)/login")} disabled={submitting}>
            <Text style={styles.footerLink}>{t("forgotPassword.backToLogin")}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
