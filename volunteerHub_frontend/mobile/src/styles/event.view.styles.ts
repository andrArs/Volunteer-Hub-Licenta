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
  
  statusBadgeWrap: { marginBottom: -4, marginTop: 12 },

  adminNoteBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 10,
  },
  adminNoteContent: { flex: 1 },
  adminNoteTitle: { color: '#991B1B', fontWeight: '800', fontSize: 13, marginBottom: 4 },
  adminNoteText: { color: '#B91C1C', fontSize: 13, lineHeight: 18 },

  approveBtnBg: { backgroundColor: '#059669' },

  rejectInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },

  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  organizerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E9EEF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerCardName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E2A3B',
  },
  organizerCardSubText: {
    fontSize: 11,
    color: '#8B93A7',
    fontWeight: '600',
    marginTop: 2,
  },

  pastEventWrap: {
    marginTop: 20,
  },
  pastEventText: {
    color: '#8B93A7',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  leaveReviewBtn: {
    marginTop: 16,
    backgroundColor: '#3F5E95',
  },
  reviewedRow: {
    marginTop: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  reviewedText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '800',
  },

  reviewModalContent: {
    maxWidth: 420,
  },
  reviewModalText: {
    marginBottom: 16,
  },
  reviewStarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  reviewCommentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 13,
    color: '#1E2A3B',
  },
  reviewSubmitBtn: {
    backgroundColor: '#3F5E95',
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
