"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getAuthSession } from "@/lib/auth-session";

type PostAuthor = {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
};

export type PostItem = {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

type PostsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type PostsData = {
  posts: PostItem[];
  pagination: PostsPagination;
};

type PostsResponse = {
  success: boolean;
  message: string;
  data: PostsData | null;
};

type PostsSuccessResponse = {
  success: true;
  message: string;
  data: PostsData;
};

type FetchPostsParams = {
  page: number;
  limit: number;
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
  responseBody?: Partial<PostsResponse> | null
) {
  return new ApiError(responseBody?.message ?? fallbackMessage, responseStatus);
}

async function parseApiBody(response: Response): Promise<PostsResponse | null> {
  try {
    return (await response.json()) as PostsResponse;
  } catch {
    return null;
  }
}

async function fetchPosts({
  page,
  limit,
}: FetchPostsParams): Promise<PostsSuccessResponse> {
  const session = getAuthSession();
  if (!session?.token) {
    throw new ApiError("Unauthorized", 401);
  }

  const response = await fetch(`/api/posts?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      accept: "*/*",
      authorization: `Bearer ${session.token}`,
    },
    cache: "no-store",
  });

  const body = await parseApiBody(response);
  if (!response.ok || !body?.success || !body.data) {
    throw buildApiError(response.status, "Failed to fetch posts", body);
  }

  return {
    success: true,
    message: body.message,
    data: body.data,
  };
}

export function usePostsInfiniteQuery(limit = 20) {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite", limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchPosts({
        page: pageParam,
        limit,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      if (page >= totalPages) {
        return undefined;
      }

      return page + 1;
    },
  });
}
