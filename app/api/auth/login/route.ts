import { NextResponse } from "next/server";

type ApiResponse<TData = unknown> = {
  success: boolean;
  message: string;
  data: TData | null;
};

type LoginRequestBody = {
  email: string;
  password: string;
};

function toApiError(message: string, status: number) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      message,
      data: null,
    },
    { status }
  );
}

async function parseJsonBody<T>(source: {
  json: () => Promise<unknown>;
}): Promise<T | null> {
  try {
    return (await source.json()) as T;
  } catch {
    return null;
  }
}

function isApiResponse(payload: unknown): payload is ApiResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const target = payload as Record<string, unknown>;
  return (
    typeof target.success === "boolean" &&
    typeof target.message === "string" &&
    ("data" in target || target.data === null)
  );
}

export async function POST(request: Request) {
  const baseApiUrl = process.env.BASE_API_URL;

  if (!baseApiUrl) {
    return toApiError("BASE_API_URL is not configured", 500);
  }

  const payload = await parseJsonBody<LoginRequestBody>(request);
  if (!payload) {
    return toApiError("Invalid request body", 400);
  }

  try {
    const response = await fetch(
      `${baseApiUrl.replace(/\/+$/, "")}/api/auth/login`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const responseBody = await parseJsonBody<unknown>(response);

    if (responseBody && isApiResponse(responseBody)) {
      return NextResponse.json(responseBody, {
        status: response.status,
      });
    }

    if (!response.ok) {
      return toApiError("Failed to login", response.status);
    }

    return toApiError("Invalid response from login service", 502);
  } catch {
    return toApiError("Unable to reach login service", 500);
  }
}
