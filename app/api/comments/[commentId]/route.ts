import { NextResponse } from "next/server";

type ApiResponse<TData = unknown> = {
  success: boolean;
  message: string;
  data: TData | null;
};

type RouteContext = {
  params: Promise<{
    commentId: string;
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

function toPositiveInt(value: string) {
  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return null;
  }

  return parsedValue;
}

export async function DELETE(request: Request, context: RouteContext) {
  const baseApiUrl = process.env.BASE_API_URL;
  if (!baseApiUrl) {
    return toApiError("BASE_API_URL is not configured", 500);
  }

  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return toApiError("Unauthorized", 401);
  }

  const { commentId: rawCommentId } = await context.params;
  const commentId = toPositiveInt(rawCommentId);
  if (!commentId) {
    return toApiError("Invalid comment id", 400);
  }

  try {
    const response = await fetch(
      `${baseApiUrl.replace(/\/+$/, "")}/api/comments/${commentId}`,
      {
        method: "DELETE",
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
      return toApiError("Failed to delete comment", response.status);
    }

    return toApiError("Invalid response from delete comment service", 502);
  } catch {
    return toApiError("Unable to reach delete comment service", 500);
  }
}
