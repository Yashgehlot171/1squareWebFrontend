import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, Permission, RoleCode, SessionPayload } from "../types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: RoleCode | null;
  roleLabel: string | null;
  permissions: Permission[];
  sessionError: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  role: null,
  roleLabel: null,
  permissions: [],
  sessionError: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<SessionPayload>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.user.role;
      state.roleLabel = action.payload.user.roleLabel;
      state.permissions = action.payload.user.permissions;
      state.sessionError = null;
      state.initialized = true;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.role = action.payload.role;
      state.roleLabel = action.payload.roleLabel;
      state.permissions = action.payload.permissions;
    },
    clearSession(state) {
      state.user = null;
      state.token = null;
      state.role = null;
      state.roleLabel = null;
      state.permissions = [];
      state.initialized = true;
    },
    setInitialized(state, action: PayloadAction<string | undefined>) {
      state.sessionError = action.payload ?? null;
      state.initialized = true;
    },
  },
});

export const { setSession, setUser, clearSession, setInitialized } = authSlice.actions;

interface UiState {
  loading: boolean;
  message: {
    message: string;
    severity: "success" | "error" | "info" | "warning";
  } | null;
}

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    loading: false,
    message: null,
  } as UiState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setGlobalMessage(state, action: PayloadAction<UiState["message"]>) {
      state.message = action.payload;
    },
    clearGlobalMessage(state) {
      state.message = null;
    },
  },
});

export const { setGlobalLoading, setGlobalMessage, clearGlobalMessage } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
