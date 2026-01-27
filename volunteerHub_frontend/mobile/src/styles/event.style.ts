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
});
