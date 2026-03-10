"use client";

import { useMutation } from "@tanstack/react-query";

type AuthUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
};

type AuthData = {
  token: string;
  user: AuthUser;
};

type AuthResponse = {
  success: boolean;
  message: string;
  data: AuthData | null;
};

type AuthSuccessResponse = {
  success: true;
  message: string;
  data: AuthData;
};

export type RegisterPayload = {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildApiError(
  responseStatus: number,
  fallbackMessage: string,
  responseBody?: Partial<AuthResponse> | null
) {
  return new ApiError(responseBody?.message ?? fallbackMessage, responseStatus);
}

async function parseApiBody(response: Response): Promise<AuthResponse | null> {
  try {
    return (await response.json()) as AuthResponse;
  } catch {
    return null;
  }
}

async function postAuth<TPayload>(
  endpoint: string,
  payload: TPayload,
  fallbackMessage: string
): Promise<AuthSuccessResponse> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });

  const body = await parseApiBody(response);
  if (!response.ok || !body?.success || !body.data) {
    throw buildApiError(response.status, fallbackMessage, body);
  }

  return {
    success: true,
    message: body.message,
    data: body.data,
  };
}

export async function register(payload: RegisterPayload) {
  return postAuth("/api/auth/register", payload, "Failed to register account");
}

export async function login(payload: LoginPayload) {
  return postAuth("/api/auth/login", payload, "Failed to login");
}

export function useRegisterMutation() {
  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: register,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: login,
  });
}
