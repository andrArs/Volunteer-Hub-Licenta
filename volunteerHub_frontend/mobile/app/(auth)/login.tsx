import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { login } from "@/src/api/auth.api";
import { toAppError } from "@/src/api/errors";
import { setAuth } from "@/src/store/auth.store";
import { getToken } from "@/src/platform/storage";

import { styles } from "../../src/styles/auth.styles";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    return email.trim().length > 0 && password.length >= 1 && !submitting;
  }, [email, password, submitting]);

  async function onSignIn() {
    if (!canSubmit) return;

    setErrorMsg(null);
    setSubmitting(true);

    try {
      const auth = await login({ email, password });
      await setAuth(auth);
      router.replace("/(tabs)");
    } catch (e) {
      const err = toAppError(e);
      setErrorMsg(err.message);
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
          <View style={styles.inputWrap}>
            <FontAwesome name="envelope" size={16} style={styles.leftIcon} />
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errorMsg) setErrorMsg(null);
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

          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <FontAwesome name="lock" size={18} style={styles.leftIcon} />
            <TextInput
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errorMsg) setErrorMsg(null);
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

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>

        <Pressable
          disabled={!canSubmit}
          style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
          onPress={onSignIn}
        >
          <Text style={styles.primaryBtnText}>
            {submitting ? "Signing In..." : "Sign In"}
          </Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable
            onPress={() => router.push("/(auth)/register")}
            disabled={submitting}
          >
            <Text style={styles.footerLink}> Register now!</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
