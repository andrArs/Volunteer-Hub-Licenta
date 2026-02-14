import { clearToken, setToken, getAuthData, setAuthData, clearAuthData } from "../platform/storage";
import type { AuthResponse } from "../types/auth";

let _auth: AuthResponse | null = null;

export async function initAuth() {
  _auth = await getAuthData();
}

export function getAuth() {
  return _auth;
}

export async function setAuth(auth: AuthResponse) {
  _auth = auth;
  await setToken(auth.token);
  await setAuthData(auth);
}

export async function logout() {
  _auth = null;
  await clearToken();
  await clearAuthData();
}
