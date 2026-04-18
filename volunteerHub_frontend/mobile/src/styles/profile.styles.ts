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
});