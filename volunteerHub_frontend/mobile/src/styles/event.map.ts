
import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  calloutContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: 220,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutArrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 10,
    alignSelf: 'center',
    marginTop: -1,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E2A3B',
    marginBottom: 6,
    textAlign: 'center',
  },
  calloutDistance: {
    fontSize: 14,
    color: '#3F5E95',
    fontWeight: '600',
    marginBottom: 12,
  },
  calloutBtn: {
    backgroundColor: '#3F5E95',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  calloutBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginRight: 8,
  },
});