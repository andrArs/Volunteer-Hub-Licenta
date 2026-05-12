import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#3F5E95",
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  inputWrap: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#C9D1E2",
    borderRadius: 10,
    height: 46,
    justifyContent: "center",
  },
  leftIcon: {
    position: "absolute",
    left: 12,
    color: "#6F7A93",
  },
  input: {
    height: 46,
    paddingLeft: 38,
    paddingRight: 12,
    fontSize: 15,
    color: "#1E2A3B",
    textAlignVertical: "center",
  },
  fieldError: {
    marginTop: 6,
    color: "#C1121F",
    fontSize: 12,
    fontWeight: "600",
    paddingLeft: 6,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#3F5E95",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footerRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: "#7E879C",
    fontSize: 13,
  },
  footerLink: {
    color: "#3F5E95",
    fontSize: 13,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 10,
    textAlign: "center",
    color: "#C1121F",
    fontSize: 13,
    fontWeight: "600",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E6EF",
  },
  dividerText: {
    color: "#8B93A7",
    fontSize: 13,
  },
  googleBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#C9D1E2",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  googleBtnText: {
    color: "#1E2A3B",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalBtn: {
    fontWeight: "700",
    color: "#3F5E95",
  },
});

export const langStyles = StyleSheet.create({
  langRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: "#C8CDD8",
  },
  langBtnActive: {
    backgroundColor: "#3F5E95",
    borderColor: "#3F5E95",
  },
  langText: {
    fontSize: 13,
    color: "#6F7A93",
    fontWeight: "600",
  },
  langTextActive: {
    color: "#fff",
  },
});
