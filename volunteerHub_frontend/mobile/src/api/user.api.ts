import { api } from "./client";
import { UserProfile } from "../types/user";


export async function getMyProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/api/users/me");
  return res.data;
}