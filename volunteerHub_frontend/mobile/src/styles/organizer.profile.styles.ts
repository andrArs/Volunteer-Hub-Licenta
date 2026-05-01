import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: 38,
    paddingHorizontal: 16,
    backgroundColor: "#3F5E95",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  backBtn: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  rightSpacer: { width: 44, height: 44 },

  content: { paddingHorizontal: 16, paddingBottom: 32 },

  profileCard: {
    alignItems: "center",
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E9EEF9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  organizerName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E2A3B",
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  ratingValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E2A3B",
  },
  totalReviews: {
    fontSize: 13,
    color: "#8B93A7",
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1E2A3B",
    marginBottom: 10,
  },

  reviewCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E2A3B",
    marginBottom: 2,
  },
  reviewEvent: {
    fontSize: 12,
    color: "#8B93A7",
    fontWeight: "600",
  },
  reviewDate: {
    fontSize: 11,
    color: "#8B93A7",
    fontWeight: "600",
  },
  reviewComment: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    fontWeight: "600",
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  errorText: { fontSize: 14, fontWeight: "800", color: "#C1121F", marginBottom: 10 },
  backTextBtn: { marginTop: 8 },
  backTextBtnText: { fontSize: 12, fontWeight: "900", color: "#3F5E95" },

  emptyWrap: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 14, color: "#8B93A7", fontWeight: "700" },

  starRow: { flexDirection: "row", gap: 2 },
  flex1: { flex: 1 },
  reviewRatingCol: { alignItems: "flex-end", gap: 4 },
});
