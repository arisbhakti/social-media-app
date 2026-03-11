import { NextResponse } from "next/server";

type ApiResponse<TData = unknown> = {
  success: boolean;
  message: string;
  data: TData | null;
};

type RouteContext = {
  params: Promise<{
    username: string;
  }>;
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

function toPositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

export async function GET(request: Request, context: RouteContext) {
  const baseApiUrl = process.env.BASE_API_URL;
  if (!baseApiUrl) {
    return toApiError("BASE_API_URL is not configured", 500);
  }

  const authorization = request.headers.get("authorization");
  const headers = new Headers();
  headers.set("accept", "*/*");
  if (authorization) {
    headers.set("authorization", authorization);
  }

  const { username: rawUsername } = await context.params;
  const username = rawUsername.trim();
  if (!username) {
    return toApiError("Invalid username", 400);
  }

  const { searchParams } = new URL(request.url);
  const page = toPositiveInt(searchParams.get("page"), 1);
  const limit = toPositiveInt(searchParams.get("limit"), 20);

  try {
    const response = await fetch(
      `${baseApiUrl.replace(/\/+$/, "")}/api/users/${encodeURIComponent(username)}/likes?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers,
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
      return toApiError("Failed to fetch user liked posts", response.status);
    }

    return toApiError("Invalid response from user liked posts service", 502);
  } catch {
    return toApiError("Unable to reach user liked posts service", 500);
  }
}
