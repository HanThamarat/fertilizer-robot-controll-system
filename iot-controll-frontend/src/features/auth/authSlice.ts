import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient, { getErrorMessage, TOKEN_KEY } from "../../api/axiosClient";

export interface AuthUser {
  email: string;
  name?: string;
  role?: "admin" | "operator";
}

export interface SignInPayload {
  email: string;
  password: string;
  remember: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const USER_KEY = "frc.user";
const useMock = import.meta.env.VITE_AUTH_MOCK === "true";

const readStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: readStoredUser(),
  token: localStorage.getItem(TOKEN_KEY),
  loading: false,
  error: null,
};

/**
 * POST /api/auth/signin → { body: { user, token } }.
 * VITE_AUTH_MOCK=true skips the server and accepts any credentials (UI work only).
 */
export const signIn = createAsyncThunk<
  { user: AuthUser; token: string; remember: boolean },
  SignInPayload,
  { rejectValue: string }
>("auth/signIn", async ({ email, password, remember }, { rejectWithValue }) => {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 500));
    return { user: { email }, token: "mock-token", remember };
  }
  try {
    const res = await axiosClient.post("/auth/signin", { email, password });
    const body = res.data.body as { user: AuthUser; token: string };
    return { ...body, remember };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, "Incorrect email or password."));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signOut(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        const { user, token, remember } = action.payload;
        state.loading = false;
        state.user = user;
        state.token = token;
        localStorage.setItem(TOKEN_KEY, token);
        (remember ? localStorage : sessionStorage).setItem(USER_KEY, JSON.stringify(user));
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Sign-in failed. Try again.";
      });
  },
});

export const { signOut, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
