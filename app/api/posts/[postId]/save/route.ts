import { NextResponse } from "next/server";

type ApiResponse<TData = unknown> = {
  success: boolean;
  message: string;
  data: TData | null;
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

async function handleRequest(
  request: Request,
  context: RouteContext,
  method: "POST" | "DELETE"
) {
  const baseApiUrl = process.env.BASE_API_URL;
  if (!baseApiUrl) {
    return toApiError("BASE_API_URL is not configured", 500);
  }

  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return toApiError("Unauthorized", 401);
  }

  const { postId: rawPostId } = await context.params;
  const postId = Number.parseInt(rawPostId, 10);
  if (Number.isNaN(postId) || postId < 1) {
    return toApiError("Invalid post id", 400);
  }

  try {
    const response = await fetch(
      `${baseApiUrl.replace(/\/+$/, "")}/api/posts/${postId}/save`,
      {
        method,
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
      return toApiError(
        method === "POST" ? "Failed to save post" : "Failed to unsave post",
        response.status
      );
    }

    return toApiError("Invalid response from post save service", 502);
  } catch {
    return toApiError("Unable to reach post save service", 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  return handleRequest(request, context, "POST");
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRequest(request, context, "DELETE");
}
