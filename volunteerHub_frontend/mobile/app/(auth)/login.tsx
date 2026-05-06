import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { login } from "@/src/api/auth.api";
import { toAppError } from "@/src/api/errors";
import { setAuth } from "@/src/store/auth.store";
import { getToken } from "@/src/platform/storage";

import { styles, langStyles } from "../../src/styles/auth.styles";
import { t, useLanguage } from "@/src/i18n/index";

export default function LoginScreen() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();

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
      } catch {
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
        <Text style={styles.title}>{t("login.appName")}</Text>

        <View style={styles.card}>
          <View style={styles.inputWrap}>
            <FontAwesome name="envelope" size={16} style={styles.leftIcon} />
            <TextInput
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={t("login.email")}
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
              onChangeText={(val) => {
                setPassword(val);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={t("login.password")}
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
            {submitting ? t("login.signingIn") : t("login.signIn")}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(auth)/forgot-password")}
          disabled={submitting}
          style={{ alignSelf: "center", marginTop: 8 }}
        >
          <Text style={styles.footerLink}>{t("login.forgotPassword")}</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t("login.noAccount")}</Text>
          <Pressable
            onPress={() => router.push("/(auth)/register")}
            disabled={submitting}
          >
            <Text style={styles.footerLink}>{t("login.registerNow")}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
