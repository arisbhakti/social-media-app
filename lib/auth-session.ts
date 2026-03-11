"use client";

const AUTH_TOKEN_KEY = "sociality_token";
const AUTH_USER_KEY = "sociality_user";
export const AUTH_SESSION_EVENT_NAME = "sociality:auth-session-updated";

export type AuthSessionUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
};

export type AuthSession = {
  token: string;
  user: AuthSessionUser | null;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function notifyAuthSessionUpdate() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_EVENT_NAME));
}

export function saveAuthSession(token: string, user: AuthSessionUser | null) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);

  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }

  notifyAuthSessionUpdate();
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  notifyAuthSessionUpdate();
}

export function getAuthSession(): AuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    return null;
  }

  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) {
    return {
      token,
      user: null,
    };
  }

  try {
    const parsedUser = JSON.parse(rawUser) as AuthSessionUser;
    return {
      token,
      user: parsedUser,
    };
  } catch {
    return {
      token,
      user: null,
    };
  }
}
