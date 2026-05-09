import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: "#F4F6F9"
  },

  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: "#3F5E95",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  rightSpacer: { width: 44, height: 44 },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  content: {
    padding: 16,
    paddingBottom: 100, 
    gap: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoIcon: {
    width: 24,
    textAlign: "center",
    marginRight: 12,
  },
  infoTextBold: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E2A3B",
  },
  infoText: {
    fontSize: 14,
    color: "#3F5E95",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E6E9F2",
    marginVertical: 12,
  },

  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "900",
    color: "#3F5E95",
  },
  statLabel: {
    fontSize: 12,
    color: "#8B93A7",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#E6E9F2",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E2A3B",
  },
  emptyText: {
    fontSize: 14,
    color: "#8B93A7",
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  reminderBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F4F6F9",
  },
  reminderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F4F6F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reminderTextWrap: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E2A3B",
    marginBottom: 2,
  },
  reminderDate: {
    fontSize: 12,
    color: "#8B93A7",
    fontWeight: "500",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  pillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#F4F6F9", 
  },
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: "#3F5E95",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logoutText: {
    color: "#3F5E95",
    fontSize: 16,
    fontWeight: "800",
  },

  loadingIndicator: { marginTop: 40 },

  editBtn: {
    width: 44,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarCircleWrap: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E9EEF9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarCircleImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#3F5E95",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E2A3B",
  },
  avatarEmail: {
    fontSize: 14,
    color: "#8B93A7",
    marginTop: 4,
  },
  userDetailsBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  userDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
    marginBottom: 12,
  },
  userDetailRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userDetailLabel: {
    color: "#8B93A7",
    fontSize: 13,
    fontWeight: "600",
  },
  userDetailValue: {
    color: "#1E2A3B",
    fontSize: 14,
    fontWeight: "700",
  },

  photoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoModalImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
  },

  optionsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsSheet: {
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
  },
  optionsBtn: {
    paddingVertical: 16,
    alignItems: "center",
  },
  optionsBtnText: {
    fontSize: 16,
    color: "#1E2A3B",
    fontWeight: "600",
  },
  optionsDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  optionsCancelText: {
    fontSize: 16,
    color: "#8B93A7",
    fontWeight: "600",
  },
  optionsRemoveText: {
    fontSize: 16,
    color: "#C1121F",
    fontWeight: "600",
  },
});