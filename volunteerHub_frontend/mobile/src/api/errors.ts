import axios from "axios";

export type AppError =
  | { type: "validation"; message: string }
  | { type: "unauthorized"; message: string }
  | { type: "network"; message: string }
  | { type: "server"; message: string };

export function toAppError(err: unknown): AppError {
  if (!axios.isAxiosError(err)) {
    return { type: "server", message: "Unexpected error." };
  }

  if (!err.response) {
    return { type: "network", message: "Cannot reach server. Check connection." };
  }

  const status = err.response.status;
  const data: any = err.response.data;

  if (status === 401) {
    return { type: "unauthorized", message: data?.error ?? "Invalid credentials." };
  }

  if (status === 400) {
    return { type: "validation", message: data?.message ?? data?.error ?? "Validation error." };
  }

  return { type: "server", message: data?.message ?? "Server error." };
}
