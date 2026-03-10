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
  if (!authorization) {
    return toApiError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const page = toPositiveInt(searchParams.get("page"), 1);
  const limit = toPositiveInt(searchParams.get("limit"), 20);

  try {
    const response = await fetch(
      `${baseApiUrl}/api/posts?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
          authorization,
        },
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
      return toApiError("Failed to fetch posts", response.status);
    }

    return toApiError("Invalid response from posts service", 502);
  } catch {
    return toApiError("Unable to reach posts service", 500);
  }
}

export async function POST(request: Request) {
  const baseApiUrl = getBaseApiUrl();
  if (!baseApiUrl) {
    return toApiError("BASE_API_URL is not configured", 500);
  }

  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return toApiError("Unauthorized", 401);
  }

  let payload: FormData;
  try {
    payload = await request.formData();
  } catch {
    return toApiError("Invalid request body", 400);
  }

  const caption = payload.get("caption");
  const image = payload.get("image");

  const normalizedCaption =
    typeof caption === "string" ? caption.trim() : "";
  if (!normalizedCaption) {
    return toApiError("Caption is required", 400);
  }

  if (!(image instanceof File) || image.size === 0) {
    return toApiError("Image is required", 400);
  }

  const forwardedPayload = new FormData();
  forwardedPayload.set("caption", normalizedCaption);
  forwardedPayload.set("image", image, image.name || "post-image.jpg");

  try {
    const response = await fetch(`${baseApiUrl}/api/posts`, {
      method: "POST",
      headers: {
        accept: "*/*",
        authorization,
      },
      body: forwardedPayload,
      cache: "no-store",
    });

    const responseBody = await parseJsonBody<unknown>(response);

    if (responseBody && isApiResponse(responseBody)) {
      return NextResponse.json(responseBody, {
        status: response.status,
      });
    }

    if (!response.ok) {
      return toApiError("Failed to create post", response.status);
    }

    return toApiError("Invalid response from create post service", 502);
  } catch {
    return toApiError("Unable to reach create post service", 500);
  }
}
