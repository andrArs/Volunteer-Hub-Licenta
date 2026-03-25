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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1E2A3B",
    marginBottom: 8,
    marginTop: 10,
  },

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

  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E9EEF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E2A3B',
  },
  avatarEmail: {
    fontSize: 14,
    color: '#8B93A7',
    marginTop: 4,
  },
  userDetailsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  userDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    marginBottom: 12,
  },
  userDetailRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userDetailLabel: {
    color: '#8B93A7',
    fontSize: 13,
    fontWeight: '600',
  },
  userDetailValue: {
    color: '#1E2A3B',
    fontSize: 14,
    fontWeight: '700',
  },
  
  rolesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  roleRowBordered: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
