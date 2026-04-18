import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" },

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

  filtersRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 10,
  },
  dropdown: {
    flex: 1,
    height: 34,
    borderWidth: 1,
    borderColor: "#C9D1E2",
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3F5E95",
    maxWidth: "88%",
  },

  searchWrap: {
    marginHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: "#C9D1E2",
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: "#1E2A3B",
  },

  content: { flex: 1, paddingTop: 10 },
  foundText: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 12,
    color: "#8B93A7",
    fontWeight: "600",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 10,
  },

  card: {
    backgroundColor: "#F3F4F8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1E2A3B",
    marginBottom: 8,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 6,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "100%",
  },
  metaText: {
    fontSize: 12,
    color: "#1E2A3B",
    fontWeight: "600",
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#C1121F", fontWeight: "800", paddingHorizontal: 24, textAlign: "center" },
  retryBtn: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C9D1E2",
  },
  retryText: { color: "#3F5E95", fontWeight: "900" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingHorizontal: 16,
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E6E9F2",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  modalTitle: { fontSize: 14, fontWeight: "900", color: "#1E2A3B" },
  modalClose: { fontSize: 12, fontWeight: "900", color: "#3F5E95" },

  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  optionText: { fontSize: 14, fontWeight: "500", color: "#1E2A3B" },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E9F2",
    backgroundColor: "#FFFFFF",
  },
  tabBtn: {
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: "#3F5E95",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B93A7",
  },
  tabTextActive: {
    color: "#3F5E95",
    fontWeight: "800",
  },
  mapButton: {
    position: 'absolute',
    bottom: 30, 
    alignSelf: 'center',
    backgroundColor: '#ff7700', 
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30, 
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10, 
  },
  badge:{
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8, 
      alignSelf: 'flex-start'
  },

  badgeMyEvent:{
     backgroundColor: '#E0E7FF',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8, 
      alignSelf: 'flex-start'
  },
  
  textBadgeMyEvent:{
    color: '#4338CA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },

  listFooter: { paddingVertical: 16, alignItems: "center" },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleInRow: { flex: 1, marginBottom: 0 },

  metaTextHighlight: { color: '#3F5E95', fontWeight: '700' },

  mapButtonText: { color: '#fff', fontWeight: '800', marginLeft: 10, fontSize: 16 },

  emptyText: { color: "#8B93A7", fontWeight: "600" },
  centerWithTopMargin: { marginTop: 40 },

  searchWrapMargin: { marginVertical: 10 },

  rolesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  rolesLabel: { fontSize: 12, fontWeight: '600', color: '#8B93A7' },

  roleBadge: {
    backgroundColor: '#E9EEF9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeAdmin: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: { color: '#3F5E95', fontSize: 11, fontWeight: '800' },
  roleBadgeTextAdmin: { color: '#DC2626', fontSize: 11, fontWeight: '800' },
});
