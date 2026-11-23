import axios from "axios";

export const TOKEN_KEY = "frc.token";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Called on 401 from any request except sign-in (e.g. expired token). Set from main.tsx. */
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401 && !err.config?.url?.includes("/auth/signin")) {
      onUnauthorized?.();
    }
    return Promise.reject(err);
  },
);

/** Pull a readable message out of an Axios error or backend `{ message }` body. */
export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Can't reach the server. Check that the backend is running.";
    const msg = (err.response.data as { message?: string } | undefined)?.message;
    return msg ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

export default axiosClient;
