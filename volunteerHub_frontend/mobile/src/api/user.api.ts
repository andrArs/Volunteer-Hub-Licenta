import { api } from "./client";
import { UserProfile } from "../types/user";
import { PagedResult } from "../types/event";


export async function getMyProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/api/users/me");
  return res.data;
}

export async function getAllUsers(pageNumber = 1, pageSize = 10): Promise<PagedResult<UserProfile>> {
  const res = await api.get<PagedResult<UserProfile>>(`/api/users?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return res.data;
}

export async function getUserById(id: string): Promise<UserProfile> {
  const res = await api.get<UserProfile>(`/api/users/${id}`);
  return res.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`); 
}

export async function updateUser(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await api.put<UserProfile>(`/api/users/${id}`, data);
  return res.data;
}

export async function assignRole(id: string, roleName: string): Promise<void> {
  await api.post(`/api/users/${id}/roles`, { roleName });
}

export async function removeRole(id: string, roleName: string): Promise<void> {
  await api.delete(`/api/users/${id}/roles/${roleName}`);
}