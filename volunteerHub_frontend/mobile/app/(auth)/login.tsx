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
import * as WebBrowser from "expo-web-browser";

import { login, googleAuth } from "@/src/api/auth.api";
import { toAppError } from "@/src/api/errors";
import { setAuth } from "@/src/store/auth.store";
import { getToken } from "@/src/platform/storage";
import { GOOGLE_WEB_CLIENT_ID } from "@/src/constants/google";

import { styles, langStyles } from "../../src/styles/auth.styles";
import { t, useLanguage } from "@/src/i18n/index";

WebBrowser.maybeCompleteAuthSession();

async function processGoogleToken(
  idToken: string,
  setGoogleSubmitting: (v: boolean) => void,
  setErrorMsg: (msg: string | null) => void,
  onSuccess: () => void
) {
  setGoogleSubmitting(true);
  setErrorMsg(null);
  try {
    const auth = await googleAuth(idToken);
    await setAuth(auth);
    onSuccess();
  } catch (e) {
    setErrorMsg(toAppError(e).message);
  } finally {
    setGoogleSubmitting(false);
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getToken();
        if (token) router.replace("/(tabs)");
      } catch {}
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const idToken = params.get("id_token");
    if (!idToken) return;
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    processGoogleToken(idToken, setGoogleSubmitting, setErrorMsg, () =>
      router.replace("/(tabs)")
    );
  }, [router]);

  async function onGooglePress() {
    if (typeof window === "undefined") return;
    const redirectUri = window.location.href.split("#")[0].split("?")[0];
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

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length >= 1 && !busy,
    [email, password, busy]
  );

  async function onSignIn() {
    if (!canSubmit) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const auth = await login({ email, password });
      await setAuth(auth);
      router.replace("/(tabs)");
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
              onChangeText={(val) => { setEmail(val); if (errorMsg) setErrorMsg(null); }}
              placeholder={t("login.email")}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.input}
              placeholderTextColor="#8B93A7"
              editable={!busy}
            />
          </View>

          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <FontAwesome name="lock" size={18} style={styles.leftIcon} />
            <TextInput
              value={password}
              onChangeText={(val) => { setPassword(val); if (errorMsg) setErrorMsg(null); }}
              placeholder={t("login.password")}
              secureTextEntry={hidePassword}
              textContentType="password"
              style={[styles.input, { paddingRight: 44 }]}
              placeholderTextColor="#8B93A7"
              editable={!busy}
            />
            <Pressable onPress={() => setHidePassword((v) => !v)} style={styles.eyeBtn} hitSlop={10} disabled={busy}>
              <FontAwesome name={hidePassword ? "eye" : "eye-slash"} size={18} color="#6F7A93" />
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

        {Platform.OS === "web" && (
          <>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t("login.or")}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              disabled={busy}
              style={[styles.googleBtn, busy && styles.primaryBtnDisabled]}
              onPress={onGooglePress}
            >
              <FontAwesome name="google" size={18} color="#DB4437" />
              <Text style={styles.googleBtnText}>
                {googleSubmitting ? t("login.signingIn") : t("login.continueWithGoogle")}
              </Text>
            </Pressable>
          </>
        )}

        <Pressable
          onPress={() => router.push("/(auth)/forgot-password")}
          disabled={busy}
          style={{ alignSelf: "center", marginTop: 8 }}
        >
          <Text style={styles.footerLink}>{t("login.forgotPassword")}</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t("login.noAccount")}</Text>
          <Pressable onPress={() => router.push("/(auth)/register")} disabled={busy}>
            <Text style={styles.footerLink}>{t("login.registerNow")}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
