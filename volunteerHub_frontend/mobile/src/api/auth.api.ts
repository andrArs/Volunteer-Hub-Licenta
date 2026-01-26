import { api } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";

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