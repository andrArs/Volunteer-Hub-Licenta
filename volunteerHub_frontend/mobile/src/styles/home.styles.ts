import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    paddingTop: 130,
    paddingBottom: 90,
    paddingHorizontal: 22,
    backgroundColor: "#3F5E95",
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    paddingTop: 4,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 24,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7ECF6",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },

  cardIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardTitle: { color: "#4A5568", fontSize: 12.5, fontWeight: "700" },

  aiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E7ECF6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 10,
  },
  aiHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiBadgeText: { color: "#3F5E95", fontWeight: "800", fontSize: 13 },

  aiOpenBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#EEF3FF" },
  aiOpenBtnText: { color: "#3F5E95", fontWeight: "800", fontSize: 12.5 },

  aiHint: { color: "#6B7280", fontSize: 12.5, lineHeight: 18 },

  aiInputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  aiInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8E1F5",
    paddingHorizontal: 12,
    color: "#1E2A3B",
    fontSize: 13.5,
    backgroundColor: "#FFFFFF",
  },
  aiSendBtn: {
    height: 42,
    width: 42,
    borderRadius: 12,
    backgroundColor: "#3F5E95",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutBtn: {
    marginTop: "auto",
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#3F5E95",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
  },
  logoutText: { color: "#3F5E95", fontWeight: "900", fontSize: 14.5 },

  aiSendBtnDisabled: { opacity: 0.5 },

  langRow: {
    position: "absolute",
    top: 56,
    left: 22,
    flexDirection: "row",
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  langBtnActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  langText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  langTextActive: {
    color: "#3F5E95",
  },
});
