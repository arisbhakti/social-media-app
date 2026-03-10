"use client";

import { useMutation } from "@tanstack/react-query";

export type RegisterPayload = {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
};

type RegisterUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
};

type RegisterData = {
  token: string;
  user: RegisterUser;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  data: RegisterData | null;
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
  responseBody?: Partial<RegisterResponse>
) {
  return new ApiError(responseBody?.message ?? fallbackMessage, responseStatus);
}

export async function register(payload: RegisterPayload) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as RegisterResponse;
  if (!response.ok || !body.success || !body.data) {
    throw buildApiError(response.status, "Failed to register account", body);
  }

  return body;
}

export function useRegisterMutation() {
  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: register,
  });
}
