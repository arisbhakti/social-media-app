import { NextResponse } from "next/server";

type ApiResponse<TData = unknown> = {
  success: boolean;
  message: string;
  data: TData | null;
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

function getBaseApiUrl() {
  const baseApiUrl = process.env.BASE_API_URL;
  if (!baseApiUrl) {
    return null;
  }

  return baseApiUrl.replace(/\/+$/, "");
}

export async function GET(request: Request) {
  const baseApiUrl = getBaseApiUrl();
  if (!baseApiUrl) {
    return toApiError("BASE_API_URL is not configured", 500);
  }

  const authorization = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = toPositiveInt(searchParams.get("page"), 1);
  const limit = toPositiveInt(searchParams.get("limit"), 20);

  if (!q) {
    return toApiError("Query is required", 400);
  }

  try {
    const headers: HeadersInit = {
      accept: "*/*",
    };

    if (authorization) {
      headers.authorization = authorization;
    }

    const response = await fetch(
      `${baseApiUrl}/api/users/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
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
      return toApiError("Failed to search users", response.status);
    }

    return toApiError("Invalid response from users search service", 502);
  } catch {
    return toApiError("Unable to reach users search service", 500);
  }
}
