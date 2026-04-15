import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { resetPassword } from "@/src/api/auth.api";
import { toAppError } from "@/src/api/errors";
import { styles } from "@/src/styles/auth.styles";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = code.length === 6 && newPassword.length >= 6 && newPassword === confirmPassword && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await resetPassword({ email: email ?? "", code, newPassword });
      router.replace("/(auth)/login");
    } catch (e) {
      setErrorMsg(toAppError(e).message);
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

        <Text style={{ textAlign: "center", color: "#7E879C", fontSize: 14, marginBottom: 20 }}>
          Enter the 6-digit code sent to{"\n"}
          <Text style={{ color: "#3F5E95", fontWeight: "700" }}>{email}</Text>
        </Text>

        <View style={styles.card}>
          <View style={styles.inputWrap}>
            <FontAwesome name="key" size={15} style={styles.leftIcon} />
            <TextInput
              value={code}
              onChangeText={(t) => { setCode(t.replace(/\D/g, "").slice(0, 6)); if (errorMsg) setErrorMsg(null); }}
              placeholder="6-digit code"
              keyboardType="number-pad"
              style={styles.input}
              placeholderTextColor="#8B93A7"
              editable={!submitting}
            />
          </View>

          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <FontAwesome name="lock" size={18} style={styles.leftIcon} />
            <TextInput
              value={newPassword}
              onChangeText={(t) => { setNewPassword(t); if (errorMsg) setErrorMsg(null); }}
              placeholder="New password"
              secureTextEntry={hidePassword}
              style={[styles.input, { paddingRight: 44 }]}
              placeholderTextColor="#8B93A7"
              editable={!submitting}
            />
            <Pressable onPress={() => setHidePassword((v) => !v)} style={styles.eyeBtn} hitSlop={10}>
              <FontAwesome name={hidePassword ? "eye" : "eye-slash"} size={18} color="#6F7A93" />
            </Pressable>
          </View>

          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <FontAwesome name="lock" size={18} style={styles.leftIcon} />
            <TextInput
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); if (errorMsg) setErrorMsg(null); }}
              placeholder="Confirm new password"
              secureTextEntry={hidePassword}
              style={styles.input}
              placeholderTextColor="#8B93A7"
              editable={!submitting}
            />
          </View>

          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <Text style={styles.fieldError}>Passwords do not match.</Text>
          )}
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>

        <Pressable
          disabled={!canSubmit}
          style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
          onPress={onSubmit}
        >
          <Text style={styles.primaryBtnText}>
            {submitting ? "Resetting..." : "Reset Password"}
          </Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Pressable onPress={() => router.back()} disabled={submitting}>
            <Text style={styles.footerLink}>Back</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
