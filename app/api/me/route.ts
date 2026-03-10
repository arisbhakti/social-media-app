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

function getBaseApiUrl() {
  const baseApiUrl = process.env.BASE_API_URL;
  if (!baseApiUrl) {
    return null;
  }

  return baseApiUrl.replace(/\/+$/, "");
}

function getAuthorization(request: Request) {
  return request.headers.get("authorization");
}

export async function GET(request: Request) {
  const baseApiUrl = getBaseApiUrl();
  if (!baseApiUrl) {
    return toApiError("BASE_API_URL is not configured", 500);
  }

  const authorization = getAuthorization(request);
  if (!authorization) {
    return toApiError("Unauthorized", 401);
  }

  try {
    const response = await fetch(`${baseApiUrl}/api/me`, {
      method: "GET",
      headers: {
        accept: "*/*",
        authorization,
      },
      cache: "no-store",
    });

    const responseBody = await parseJsonBody<unknown>(response);

    if (responseBody && isApiResponse(responseBody)) {
      return NextResponse.json(responseBody, {
        status: response.status,
      });
    }

    if (!response.ok) {
      return toApiError("Failed to fetch profile", response.status);
    }

    return toApiError("Invalid response from profile service", 502);
  } catch {
    return toApiError("Unable to reach profile service", 500);
  }
}

export async function PATCH(request: Request) {
  const baseApiUrl = getBaseApiUrl();
  if (!baseApiUrl) {
    return toApiError("BASE_API_URL is not configured", 500);
  }

  const authorization = getAuthorization(request);
  if (!authorization) {
    return toApiError("Unauthorized", 401);
  }

  let payload: FormData;
  try {
    payload = await request.formData();
  } catch {
    return toApiError("Invalid request body", 400);
  }

  try {
    const response = await fetch(`${baseApiUrl}/api/me`, {
      method: "PATCH",
      headers: {
        accept: "*/*",
        authorization,
      },
      body: payload,
      cache: "no-store",
    });

    const responseBody = await parseJsonBody<unknown>(response);

    if (responseBody && isApiResponse(responseBody)) {
      return NextResponse.json(responseBody, {
        status: response.status,
      });
    }

    if (!response.ok) {
      return toApiError("Failed to update profile", response.status);
    }

    return toApiError("Invalid response from update profile service", 502);
  } catch {
    return toApiError("Unable to reach update profile service", 500);
  }
}
