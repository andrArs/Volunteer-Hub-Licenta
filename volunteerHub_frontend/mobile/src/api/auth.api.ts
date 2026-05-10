import { api } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest, ResetPasswordRequest } from "../types/auth";

export async function googleAuth(idToken: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/google", { IdToken: idToken });
  return res.data;
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/login", {
    Email: req.email,
    Password: req.password,
  });
  return res.data;
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/register", {
    FirstName: req.FirstName,
    LastName: req.LastName,
    DateOfBirth: req.DateOfBirth,
    Email: req.Email,
    Password: req.Password,
  });
  return res.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/api/auth/forgot-password", { Email: email });
}

export async function resetPassword(req: ResetPasswordRequest): Promise<void> {
  await api.post("/api/auth/reset-password", {
    Email: req.email,
    Code: req.code,
    NewPassword: req.newPassword,
  });
}