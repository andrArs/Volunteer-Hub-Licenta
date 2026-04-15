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

  if (status === 404) {
    return { type: "server", message: "Resource not found." };
  }

  if (status >= 500) {
    return { type: "server", message: "Server error. Please try again later." };
  }

  return { type: "server", message: data?.message ?? data?.error ?? "Something went wrong." };
}
