import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#000" },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 44,
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
  cameraIcon: { marginBottom: 16 },
  permissionText: { fontSize: 15, fontWeight: "600", color: "#374151", textAlign: "center", marginBottom: 20 },
  grantBtn: { backgroundColor: "#3F5E95", borderRadius: 999, paddingHorizontal: 24, paddingVertical: 12 },
  grantBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  cameraWrap: { flex: 1, position: "relative" },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
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
