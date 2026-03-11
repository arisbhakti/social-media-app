import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthSession, AuthSessionUser } from "@/lib/auth-session";

export type AuthState = {
  token: string | null;
  user: AuthSessionUser | null;
};

const initialState: AuthState = {
  token: null,
  user: null,
};

function mapSessionToState(session: AuthSession | null): AuthState {
  if (!session?.token) {
    return {
      token: null,
      user: null,
    };
  }

  return {
    token: session.token,
    user: session.user ?? null,
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    syncAuthSession(state, action: PayloadAction<AuthSession | null>) {
      const nextState = mapSessionToState(action.payload);
      state.token = nextState.token;
      state.user = nextState.user;
    },
    setAuthSession(
      state,
      action: PayloadAction<{
        token: string;
        user: AuthSessionUser | null;
      }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    setAuthUser(state, action: PayloadAction<AuthSessionUser | null>) {
      state.user = action.payload;
    },
    clearAuthState(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { syncAuthSession, setAuthSession, setAuthUser, clearAuthState } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
