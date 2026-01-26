import { clearToken, setToken } from "../platform/storage";
import type { AuthResponse } from "../types/auth";

let _auth: AuthResponse | null = null;

export function getAuth() {
  return _auth;
}

export async function setAuth(auth: AuthResponse) {
  _auth = auth;
  await setToken(auth.token);
}

export async function logout() {
  _auth = null;
  await clearToken();
}
