import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
    },

    backIconBtn: {
    marginRight: 10,
    padding: 4,
    },

    header: {
  paddingTop: Platform.OS === "ios" ? 60 : 44,
  paddingBottom: 38,
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

rightSpacer: {
  width: 44,
  height: 44,
},

backBtn: {
  width: 44,
  height: 44,
  alignItems: "flex-start",
  justifyContent: "center",
},


  screenTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E2A3B",
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    paddingTop:10,
    fontWeight: "800",
    color: "#1E2A3B",
    marginBottom: 10,
  },

  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "#E9EEF9",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 16,
  },
  categoryText: { fontSize: 12, fontWeight: "800", color: "#3F5E95" },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1E2A3B",
    marginBottom: 8,
    marginTop: 10,
  },

  description: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E2A3B",
    lineHeight: 18,
    marginBottom: 14,
  },

  infoBlock: {
    borderWidth: 1,
    borderColor: "#E6E9F2",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 10,
    alignItems: "flex-start",
  },

  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 12, fontWeight: "800", color: "#8B93A7", marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: "800", color: "#1E2A3B" },
  infoSubValue: { fontSize: 12, fontWeight: "700", color: "#1E2A3B", marginTop: 2 },

  fullText: { marginTop: 4, fontSize: 12, fontWeight: "800", color: "#8E1B1B" },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  secondaryBtn: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C9D1E2",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  secondaryBtnText: { fontSize: 12, fontWeight: "900", color: "#3F5E95" },

  secondaryBtnActive: {
    backgroundColor: "#3F5E95",
    borderColor: "#3F5E95",
  },
  secondaryBtnTextActive: { color: "#FFFFFF" },

  primaryBtn: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#4A5568",
  },
  primaryBtnText: { fontSize: 12, fontWeight: "900", color: "#FFFFFF" },

  primaryBtnActive: { backgroundColor: "#3F5E95" },

  primaryBtnDisabled: { backgroundColor: "#A1A8B5" },

  dangerBtn: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FBEAEA",
  },
  dangerBtnText: { fontSize: 12, fontWeight: "900", color: "#8E1B1B" },

  btnDisabled: { opacity: 0.65 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  errorText: { fontSize: 14, fontWeight: "800", color: "#C1121F", marginBottom: 10 },

  backBtnText: { fontSize: 12, fontWeight: "900", color: "#3F5E95" },
  
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12, 
  },
});
