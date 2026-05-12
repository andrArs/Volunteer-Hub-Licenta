import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F4F6FB" },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#3F5E95",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  backBtn: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  rightSpacer: { width: 44 },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#C1121F", fontSize: 14, fontWeight: "700" },

  content: { padding: 16 },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#8B93A7",
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E6E9F2",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowIcon: { width: 22 },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: "#1E2A3B", marginLeft: 10 },
  rowValue: { fontSize: 16, fontWeight: "900", color: "#1E2A3B" },

  divider: { height: 1, backgroundColor: "#E6E9F2" },

  emptyText: { color: "#8B93A7", fontSize: 13, fontWeight: "600", paddingVertical: 16, textAlign: "center" },
});
