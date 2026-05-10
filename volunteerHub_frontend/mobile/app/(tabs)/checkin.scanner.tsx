import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { checkIn } from "@/src/api/event.api";
import { t, useLanguage } from "@/src/i18n/index";

export default function CheckInScannerScreen() {
  const router = useRouter();
  useLanguage();

  const [permission, requestPermission] = useCameraPermissions();
  const [done, setDone] = useState(false);
  const scanLock = useRef(false);

  async function onBarcodeScanned({ data }: { data: string }) {
    if (scanLock.current || done) return;
    scanLock.current = true;

    try {
      await checkIn(data);
      setDone(true);
      Alert.alert(t("checkIn.success"), t("checkIn.successMessage"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const code = err?.response?.data?.code ?? "";
      let msg = t("checkIn.errorGeneric");
      if (code === "event_not_active") msg = t("checkIn.errorNotActive");
      else if (code === "not_registered") msg = t("checkIn.errorNotRegistered");
      else if (code === "invalid_token") msg = t("checkIn.errorInvalidToken");

      Alert.alert(t("common.error"), msg, [
        { text: "OK", onPress: () => { scanLock.current = false; } },
      ]);
    }
  }

  if (!permission) return <View style={styles.page} />;

  if (!permission.granted) {
    return (
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={18} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>{t("checkIn.title")}</Text>
          <View style={styles.rightSpacer} />
        </View>
        <View style={styles.center}>
          <FontAwesome name="camera" size={48} color="#8B93A7" style={{ marginBottom: 16 }} />
          <Text style={styles.permissionText}>{t("checkIn.permissionDenied")}</Text>
          <Pressable style={styles.grantBtn} onPress={requestPermission}>
            <Text style={styles.grantBtnText}>{t("checkIn.grantPermission")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{t("checkIn.title")}</Text>
        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={done ? undefined : onBarcodeScanned}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.instructions}>{t("checkIn.instructions")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#000" },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#3F5E95",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  backBtn: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  rightSpacer: { width: 44 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  permissionText: { fontSize: 15, fontWeight: "600", color: "#374151", textAlign: "center", marginBottom: 20 },
  grantBtn: { backgroundColor: "#3F5E95", borderRadius: 999, paddingHorizontal: 24, paddingVertical: 12 },
  grantBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  cameraWrap: { flex: 1, position: "relative" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  instructions: {
    marginTop: 24,
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
});
