"use client";

const AUTH_TOKEN_KEY = "sociality_token";
const AUTH_USER_KEY = "sociality_user";

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

export function saveAuthSession(token: string, user: AuthSessionUser | null) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);

  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthSession(): AuthSession | null {
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
