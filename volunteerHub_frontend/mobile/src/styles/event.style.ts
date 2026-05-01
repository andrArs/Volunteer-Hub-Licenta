import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
  paddingTop: Platform.OS === "ios" ? 60 : 44,
  paddingBottom: 18,
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

  Icon: {
    position: "absolute",
    left: 12,
    color: "#ffffff",
  },

  backBtn: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
    },

    rightSpacer: {
        width: 44,
        height: 44,
    },

  card: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },

  inputWrap: {
    borderWidth: 1,
    borderColor: "#C9D1E2",
    borderRadius: 12,
    height: 54,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  input: {
    height: 54,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1E2A3B",
    textAlignVertical: "center",
  },

  pressableInput: {
    height: 54,
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  placeholderText: {
    fontSize: 15,
    color: "#8B93A7",
  },
  valueText: {
    fontSize: 15,
    color: "#1E2A3B",
  },

  primaryBtn: {
    height: 54,
    marginHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#3F5E95",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 22,
  },

  primaryBtnDisabled: {
    opacity: 0.55,
  },

  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  fieldError: {
    marginTop: 6,
    color: "#C1121F",
    fontSize: 12,
    fontWeight: "600",
    paddingLeft: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 12,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },

  modalBtn: {
    color: "#3F5E95",
    fontWeight: "900",
    fontSize: 14,
  },

  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  optionText: {
    fontSize: 15,
    color: "#1E2A3B",
    fontWeight: "700",
  },
  label: {
  marginBottom: 6,
  marginLeft: 6,
  fontSize: 12,
  fontWeight: "700",
  color: "#3F5E95",
},
autocompleteWrapper: {
    position: 'relative',
    zIndex: 999,
  },
  autocompleteList: {
    position: 'absolute',
    bottom: '100%', 
    left: 0,
    right: 0,
    marginBottom: 4,
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#C9D1E2', 
    borderRadius: 12, 
    maxHeight: 200, 
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 10, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F4F6F9'
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionTitle: {
    fontWeight: '700', 
    color: '#1E2A3B', 
    fontSize: 14 
  },
  suggestionDesc: {
    color: '#8B93A7', 
    fontSize: 12, 
    marginTop: 2 
  },
  locationInputWrap: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingRight: 12 
  },
  locationInput: {
    flex: 1,
    borderBottomWidth: 0
  },

  flex1: { flex: 1 },
  labelSpaced: { marginTop: 12 },

  modalHeaderTitle: { fontWeight: "900", color: "#1E2A3B" },
  modalHeaderSpacer: { width: 46 },

  errorContainer: { alignItems: "center", marginTop: 16, paddingHorizontal: 4 },
  errorMain: { color: "#D92D20", fontWeight: "700", marginBottom: 6 },
  errorField: { color: "#D92D20", marginBottom: 4 },

  primaryBtnTopMargin: { marginTop: 20 },
});
