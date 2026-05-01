import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: {
     flex: 1, 
     backgroundColor: "#F4F6F9" },

  header: { 
    paddingTop: 60, 
    paddingBottom: 20, 
    paddingHorizontal: 16, 
    backgroundColor: "#3F5E95", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between" },

  headerTitle: {
     color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800" },

  backBtn: { 
    width: 44, 
    height: 44, 
    justifyContent: "center" },

  rightSpacer: { 
    width: 44 },

  content: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: 16 },

  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" },

  foundText: { 
    fontSize: 14, 
    fontWeight: "700", 
    color: "#8B93A7", 
    marginBottom: 12 },

  listContent: { 
    paddingBottom: 40 },

  card: { 
    backgroundColor: "#fff", 
    padding: 16, 
    borderRadius: 12,
    marginBottom: 12, 
    shadowColor: "#000", 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 2 },

  cardTitle: { 
    fontSize: 16, 
    fontWeight: "800", 
    color: "#1E2A3B" },

  metaRow: { 
    flexDirection: "row", 
    marginTop: 8 },

  metaItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6 },

  metaText: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: "#8B93A7" },

  pendingBadge: { 
    backgroundColor: "#FEF3C7", 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 },

  pendingBadgeText: { 
    color: "#D97706", 
    fontSize: 10, 
    fontWeight: "800" },

  errorText: { 
    color: "#DC2626", 
    fontWeight: "600", 
    marginBottom: 10 },

  retryBtn: { 
    padding: 10, 
    backgroundColor: "#3F5E95", 
    borderRadius: 8 },
    
  retryText: {
    color: "#fff",
    fontWeight: "700" },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleInRow: { flex: 1, marginBottom: 0 },

  emptyWrap: { marginTop: 40 },
  emptySuccessTitle: { color: "#059669", fontWeight: "800", fontSize: 16 },
  emptySuccessSubtitle: { color: "#8B93A7", marginTop: 8 },
});