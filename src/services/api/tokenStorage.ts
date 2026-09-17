import { AUTH_STORAGE_KEY } from "../../constants/storage";
import type { SessionPayload } from "../../types";

export const TOKEN_STORAGE_KEYS = {
  accessToken: "1square_property_access_token",
  refreshToken: "1square_property_refresh_token",
  session: AUTH_STORAGE_KEY,
} as const;

const storageFor = (remember = true) => (remember ? localStorage : sessionStorage);
const hasPersistentSession = () => Boolean(localStorage.getItem(TOKEN_STORAGE_KEYS.session) || localStorage.getItem(TOKEN_STORAGE_KEYS.accessToken));

export const tokenStorage = {
  getAccessToken() {
    return (
      localStorage.getItem(TOKEN_STORAGE_KEYS.accessToken) ??
      sessionStorage.getItem(TOKEN_STORAGE_KEYS.accessToken) ??
      this.getSession()?.token ??
      null
    );
  },

  setAccessToken(token: string, remember = hasPersistentSession()) {
    this.removeAccessToken();
    storageFor(remember).setItem(TOKEN_STORAGE_KEYS.accessToken, token);
  },

  removeAccessToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.accessToken);
    sessionStorage.removeItem(TOKEN_STORAGE_KEYS.accessToken);
  },

  getRefreshToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEYS.refreshToken) ?? sessionStorage.getItem(TOKEN_STORAGE_KEYS.refreshToken);
  },

  setRefreshToken(token: string, remember = hasPersistentSession()) {
    this.removeRefreshToken();
    storageFor(remember).setItem(TOKEN_STORAGE_KEYS.refreshToken, token);
  },

  removeRefreshToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.refreshToken);
    sessionStorage.removeItem(TOKEN_STORAGE_KEYS.refreshToken);
  },

  getAdminUser() {
    return this.getSession()?.user ?? null;
  },

  setAdminUser(user: SessionPayload["user"], remember = hasPersistentSession()) {
    const session = this.getSession();
    const updatedSession: SessionPayload = {
      token: session?.token ?? this.getAccessToken() ?? "",
      refreshToken: session?.refreshToken ?? this.getRefreshToken() ?? undefined,
      user,
      tokenExpiresAt: session?.tokenExpiresAt,
    };
    this.setSession(updatedSession, remember);
  },

  removeAdminUser() {
    const session = this.getSession();
    if (!session) {
      return;
    }
    const remember = this.shouldPersistSession();
    this.clearSession();
    if (session.token) {
      this.setAccessToken(session.token, remember);
    }
    if (session.refreshToken) {
      this.setRefreshToken(session.refreshToken, remember);
    }
  },

  shouldPersistSession() {
    return hasPersistentSession();
  },

  setTokens(tokens: { token?: string; accessToken?: string; refreshToken?: string }, remember = true) {
    const storage = storageFor(remember);
    const existingRefreshToken = this.getRefreshToken();
    this.clearTokens();

    const accessToken = tokens.token ?? tokens.accessToken;
    if (accessToken) {
      storage.setItem(TOKEN_STORAGE_KEYS.accessToken, accessToken);
    }
    const refreshToken = tokens.refreshToken ?? existingRefreshToken;
    if (refreshToken) {
      storage.setItem(TOKEN_STORAGE_KEYS.refreshToken, refreshToken);
    }
  },

  getSession() {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEYS.session) ?? sessionStorage.getItem(TOKEN_STORAGE_KEYS.session);
    return raw ? (JSON.parse(raw) as SessionPayload) : null;
  },

  setSession(session: SessionPayload, remember = true) {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.session);
    sessionStorage.removeItem(TOKEN_STORAGE_KEYS.session);
    this.clearTokens();
    storageFor(remember).setItem(TOKEN_STORAGE_KEYS.session, JSON.stringify(session));
    this.setTokens({ token: session.token, refreshToken: session.refreshToken }, remember);
  },

  updateSessionTokens(tokens: { token?: string; accessToken?: string; refreshToken?: string }) {
    const session = this.getSession();
    if (!session) {
      this.setTokens(tokens);
      return;
    }

    const remember = Boolean(localStorage.getItem(TOKEN_STORAGE_KEYS.session));
    const updatedSession: SessionPayload = {
      ...session,
      token: tokens.token ?? tokens.accessToken ?? session.token,
      refreshToken: tokens.refreshToken ?? session.refreshToken,
    };
    this.setSession(updatedSession, remember);
  },

  clearTokens() {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.accessToken);
    sessionStorage.removeItem(TOKEN_STORAGE_KEYS.accessToken);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.refreshToken);
    sessionStorage.removeItem(TOKEN_STORAGE_KEYS.refreshToken);
  },

  clearSession() {
    this.clearTokens();
    localStorage.removeItem(TOKEN_STORAGE_KEYS.session);
    sessionStorage.removeItem(TOKEN_STORAGE_KEYS.session);
  },

  clearAdminSession() {
    this.clearSession();
  },
};
