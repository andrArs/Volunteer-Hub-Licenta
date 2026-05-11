import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { checkIn } from "@/src/api/event.api";
import { t, useLanguage } from "@/src/i18n/index";
import { styles } from "@/src/styles/checkin.scanner.styles";

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
          <FontAwesome name="camera" size={48} color="#8B93A7" style={styles.cameraIcon} />
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
          style={StyleSheet.absoluteFillObject}
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

