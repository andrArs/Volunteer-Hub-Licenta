import { Platform } from "react-native";

const PORT = 5182;
const DEV_LAN_IP = "172.20.10.6";

const DEV_WEB = `http://localhost:${PORT}`;
const DEV_DEVICE = `http://${DEV_LAN_IP}:${PORT}`;
const PROD_URL = "https://volunteerhub-api-gsd6dfe4h6dxgugd.swedencentral-01.azurewebsites.net";

export const API_BASE_URL = __DEV__
  ? (Platform.OS === "web" ? DEV_WEB : DEV_DEVICE)
  : PROD_URL;

//export const API_BASE_URL = "https://volunteerhub-api-gsd6dfe4h6dxgugd.swedencentral-01.azurewebsites.net";
