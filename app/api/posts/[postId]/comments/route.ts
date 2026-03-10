import { NextResponse } from "next/server";

type ApiResponse<TData = unknown> = {
  success: boolean;
  message: string;
  data: TData | null;
};

type CreateCommentRequestBody = {
  text: string;
};

type RouteContext = {
  params: Promise<{
    postId: string;
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

async function parsePostId(context: RouteContext) {
  const { postId: rawPostId } = await context.params;
  const postId = Number.parseInt(rawPostId, 10);
  if (Number.isNaN(postId) || postId < 1) {
    return null;
  }

  return postId;
}

export async function GET(request: Request, context: RouteContext) {
  const baseApiUrl = process.env.BASE_API_URL;
  if (!baseApiUrl) {
    return toApiError("BASE_API_URL is not configured", 500);
  }

  const postId = await parsePostId(context);
  if (!postId) {
    return toApiError("Invalid post id", 400);
  }

  const { searchParams } = new URL(request.url);
  const page = toPositiveInt(searchParams.get("page"), 1);
  const limit = toPositiveInt(searchParams.get("limit"), 10);
  const authorization = request.headers.get("authorization");

  const headers = new Headers();
  headers.set("accept", "*/*");
  if (authorization) {
    headers.set("authorization", authorization);
  }

  try {
    const response = await fetch(
      `${baseApiUrl.replace(/\/+$/, "")}/api/posts/${postId}/comments?page=${page}&limit=${limit}`,
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
      return toApiError("Failed to fetch post comments", response.status);
    }

    return toApiError("Invalid response from post comments service", 502);
  } catch {
    return toApiError("Unable to reach post comments service", 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const baseApiUrl = process.env.BASE_API_URL;
  if (!baseApiUrl) {
    return toApiError("BASE_API_URL is not configured", 500);
  }

  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return toApiError("Unauthorized", 401);
  }

  const postId = await parsePostId(context);
  if (!postId) {
    return toApiError("Invalid post id", 400);
  }

  const payload = await parseJsonBody<CreateCommentRequestBody>(request);
  const text = payload?.text?.trim() ?? "";
  if (!text) {
    return toApiError("Comment text is required", 400);
  }

  try {
    const response = await fetch(
      `${baseApiUrl.replace(/\/+$/, "")}/api/posts/${postId}/comments`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          authorization,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
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
      return toApiError("Failed to create comment", response.status);
    }

    return toApiError("Invalid response from create comment service", 502);
  } catch {
    return toApiError("Unable to reach create comment service", 500);
  }
}
