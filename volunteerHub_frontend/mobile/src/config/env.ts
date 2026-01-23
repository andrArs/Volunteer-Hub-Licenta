import { Platform } from "react-native";

const PORT = 5182;
const DEV_LAN_IP = "172.20.10.6";

const DEV_WEB = `http://localhost:${PORT}`;
const DEV_DEVICE = `http://${DEV_LAN_IP}:${PORT}`;

export const API_BASE_URL = Platform.OS === "web" ? DEV_WEB : DEV_DEVICE;
