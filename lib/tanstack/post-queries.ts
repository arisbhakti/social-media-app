"use client";

import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { showErrorToast, showSuccessToast } from "@/components/ui/app-toast";
import { getAuthSession } from "@/lib/auth-session";

type ApiResponse<TData> = {
  success: boolean;
  message: string;
  data: TData | null;
};

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
  savedByMe?: boolean;
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

export type PostsSuccessResponse = {
  success: true;
  message: string;
  data: PostsData;
};

type LikedPostItem = PostItem & {
  likedAt: string;
};

type MyLikedPostsData = {
  posts: LikedPostItem[];
  pagination: PostsPagination;
};

export type MyLikedPostsSuccessResponse = {
  success: true;
  message: string;
  data: MyLikedPostsData;
};

type SavedPostItem = {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
};

type MySavedPostsData = {
  posts: SavedPostItem[];
  pagination: PostsPagination;
};

export type MySavedPostsSuccessResponse = {
  success: true;
  message: string;
  data: MySavedPostsData;
};

type FollowingUserItem = {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
};

type MyFollowingData = {
  users: FollowingUserItem[];
  pagination: PostsPagination;
};

export type MyFollowingSuccessResponse = {
  success: true;
  message: string;
  data: MyFollowingData;
};

export type PostLikeUser = {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
  isMe: boolean;
  followsMe: boolean;
};

type PostLikesData = {
  users: PostLikeUser[];
  pagination: PostsPagination;
};

export type PostLikesSuccessResponse = {
  success: true;
  message: string;
  data: PostLikesData;
};

type TogglePostLikeData = {
  liked: boolean;
  likeCount: number;
};

type TogglePostLikeSuccessResponse = {
  success: true;
  message: string;
  data: TogglePostLikeData;
};

type TogglePostSaveData = {
  saved: boolean;
};

type TogglePostSaveSuccessResponse = {
  success: true;
  message: string;
  data: TogglePostSaveData;
};

type ToggleFollowData = {
  following: boolean;
};

type ToggleFollowSuccessResponse = {
  success: true;
  message: string;
  data: ToggleFollowData;
};

type FetchPostsParams = {
  page: number;
  limit: number;
};

type FetchCollectionParams = {
  page: number;
  limit: number;
};

type TogglePostLikeVariables = {
  postId: number;
  liked: boolean;
};

type TogglePostLikeContext = {
  previousPostQueries: Array<[QueryKey, PostsInfiniteData | undefined]>;
  previousLikedIdQueries: Array<[QueryKey, number[] | undefined]>;
};

type TogglePostSaveVariables = {
  postId: number;
  saved: boolean;
};

type TogglePostSaveContext = {
  previousPostQueries: Array<[QueryKey, PostsInfiniteData | undefined]>;
  previousSavedIdQueries: Array<[QueryKey, number[] | undefined]>;
};

type ToggleFollowVariables = {
  postId: number;
  userId: number;
  username: string;
  following: boolean;
};

type ToggleFollowContext = {
  previousPostLikesQueries: Array<[QueryKey, PostLikesInfiniteData | undefined]>;
  previousFollowingIdQueries: Array<[QueryKey, number[] | undefined]>;
};

type ToggleLikeMutationOptions = {
  showToast?: boolean;
};

type ToggleSaveMutationOptions = {
  showToast?: boolean;
};

type ToggleFollowMutationOptions = {
  showToast?: boolean;
};

type RequestApiInit = RequestInit & {
  cache?: RequestCache;
};

export const postQueryKeys = {
  feedInfinite: (limit = 20) => ["posts", "infinite", limit] as const,
  likedPostIds: (limit = 50) => ["posts", "liked", "ids", limit] as const,
  savedPostIds: (limit = 50) => ["posts", "saved", "ids", limit] as const,
  postLikesInfinite: (postId: number, limit = 20) =>
    ["posts", postId, "likes", "infinite", limit] as const,
  followingUserIds: (limit = 50) => ["me", "following", "ids", limit] as const,
};

type PostsInfiniteData = InfiniteData<PostsSuccessResponse, number>;
type PostLikesInfiniteData = InfiniteData<PostLikesSuccessResponse, number>;

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
  responseBody?: { message?: string } | null
) {
  return new ApiError(responseBody?.message ?? fallbackMessage, responseStatus);
}

async function parseApiBody<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getSessionToken() {
  const session = getAuthSession();
  if (!session?.token) {
    throw new ApiError("Unauthorized", 401);
  }

  return session.token;
}

async function requestApi<TData>(
  endpoint: string,
  init: RequestApiInit,
  fallbackMessage: string
): Promise<{
  success: true;
  message: string;
  data: TData;
}> {
  const token = getSessionToken();
  const headers = new Headers(init.headers);
  headers.set("accept", "*/*");
  headers.set("authorization", `Bearer ${token}`);

  const response = await fetch(endpoint, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });

  const body = await parseApiBody<ApiResponse<TData>>(response);
  if (!response.ok || !body?.success || !body.data) {
    throw buildApiError(response.status, fallbackMessage, body);
  }

  return {
    success: true,
    message: body.message,
    data: body.data,
  };
}

async function fetchPosts({
  page,
  limit,
}: FetchPostsParams): Promise<PostsSuccessResponse> {
  return requestApi<PostsData>(
    `/api/posts?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch posts"
  );
}

async function fetchMyLikedPosts({
  page,
  limit,
}: FetchCollectionParams): Promise<MyLikedPostsSuccessResponse> {
  return requestApi<MyLikedPostsData>(
    `/api/me/likes?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch liked posts"
  );
}

async function fetchMySavedPosts({
  page,
  limit,
}: FetchCollectionParams): Promise<MySavedPostsSuccessResponse> {
  return requestApi<MySavedPostsData>(
    `/api/me/saved?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch saved posts"
  );
}

async function fetchMyFollowing({
  page,
  limit,
}: FetchCollectionParams): Promise<MyFollowingSuccessResponse> {
  return requestApi<MyFollowingData>(
    `/api/me/following?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch following users"
  );
}

async function fetchPostLikes({
  postId,
  page,
  limit,
}: FetchCollectionParams & {
  postId: number;
}): Promise<PostLikesSuccessResponse> {
  return requestApi<PostLikesData>(
    `/api/posts/${postId}/likes?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch users who liked this post"
  );
}

async function fetchAllLikedPostIds(limit: number): Promise<number[]> {
  const likedPostIds = new Set<number>();
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await fetchMyLikedPosts({
      page: currentPage,
      limit,
    });

    for (const post of response.data.posts) {
      likedPostIds.add(post.id);
    }

    totalPages = response.data.pagination.totalPages;
    currentPage += 1;
  } while (currentPage <= totalPages);

  return Array.from(likedPostIds);
}

async function fetchAllSavedPostIds(limit: number): Promise<number[]> {
  const savedPostIds = new Set<number>();
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await fetchMySavedPosts({
      page: currentPage,
      limit,
    });

    for (const post of response.data.posts) {
      savedPostIds.add(post.id);
    }

    totalPages = response.data.pagination.totalPages;
    currentPage += 1;
  } while (currentPage <= totalPages);

  return Array.from(savedPostIds);
}

async function fetchAllFollowingUserIds(limit: number): Promise<number[]> {
  const followingUserIds = new Set<number>();
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await fetchMyFollowing({
      page: currentPage,
      limit,
    });

    for (const user of response.data.users) {
      followingUserIds.add(user.id);
    }

    totalPages = response.data.pagination.totalPages;
    currentPage += 1;
  } while (currentPage <= totalPages);

  return Array.from(followingUserIds);
}

async function togglePostLike({
  postId,
  liked,
}: TogglePostLikeVariables): Promise<TogglePostLikeSuccessResponse> {
  return requestApi<TogglePostLikeData>(
    `/api/posts/${postId}/like`,
    {
      method: liked ? "DELETE" : "POST",
    },
    liked ? "Failed to unlike post" : "Failed to like post"
  );
}

async function togglePostSave({
  postId,
  saved,
}: TogglePostSaveVariables): Promise<TogglePostSaveSuccessResponse> {
  return requestApi<TogglePostSaveData>(
    `/api/posts/${postId}/save`,
    {
      method: saved ? "DELETE" : "POST",
    },
    saved ? "Failed to unsave post" : "Failed to save post"
  );
}

async function toggleFollow({
  username,
  following,
}: ToggleFollowVariables): Promise<ToggleFollowSuccessResponse> {
  return requestApi<ToggleFollowData>(
    `/api/follow/${encodeURIComponent(username)}`,
    {
      method: following ? "DELETE" : "POST",
    },
    following ? "Failed to unfollow user" : "Failed to follow user"
  );
}

function updatePostInInfiniteFeed(
  source: PostsInfiniteData | undefined,
  postId: number,
  updater: (post: PostItem) => PostItem
) {
  if (!source) {
    return source;
  }

  return {
    ...source,
    pages: source.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        posts: page.data.posts.map((post) =>
          post.id === postId ? updater(post) : post
        ),
      },
    })),
  };
}

function updatePostLikesInInfiniteData(
  source: PostLikesInfiniteData | undefined,
  userId: number,
  updater: (user: PostLikeUser) => PostLikeUser
) {
  if (!source) {
    return source;
  }

  return {
    ...source,
    pages: source.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        users: page.data.users.map((user) =>
          user.id === userId ? updater(user) : user
        ),
      },
    })),
  };
}

function updateIdsArray(
  source: number[] | undefined,
  itemId: number,
  exists: boolean
) {
  if (!source) {
    return source;
  }

  const nextIds = new Set(source);
  if (exists) {
    nextIds.add(itemId);
  } else {
    nextIds.delete(itemId);
  }

  return Array.from(nextIds);
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function usePostsInfiniteQuery(limit = 20) {
  return useInfiniteQuery({
    queryKey: postQueryKeys.feedInfinite(limit),
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

export function useMyLikedPostIdsQuery(limit = 50, enabled = true) {
  return useQuery({
    queryKey: postQueryKeys.likedPostIds(limit),
    queryFn: () => fetchAllLikedPostIds(limit),
    enabled,
    staleTime: 30_000,
  });
}

export function useMySavedPostIdsQuery(limit = 50, enabled = true) {
  return useQuery({
    queryKey: postQueryKeys.savedPostIds(limit),
    queryFn: () => fetchAllSavedPostIds(limit),
    enabled,
    staleTime: 30_000,
  });
}

export function useMyFollowingUserIdsQuery(limit = 50, enabled = true) {
  return useQuery({
    queryKey: postQueryKeys.followingUserIds(limit),
    queryFn: () => fetchAllFollowingUserIds(limit),
    enabled,
    staleTime: 30_000,
  });
}

export function usePostLikesInfiniteQuery(
  postId: number,
  limit = 20,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: postQueryKeys.postLikesInfinite(postId, limit),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchPostLikes({
        postId,
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
    enabled: enabled && postId > 0,
  });
}

export function useTogglePostLikeMutation(
  options: ToggleLikeMutationOptions = {}
) {
  const { showToast = true } = options;
  const queryClient = useQueryClient();

  return useMutation<
    TogglePostLikeSuccessResponse,
    unknown,
    TogglePostLikeVariables,
    TogglePostLikeContext
  >({
    mutationKey: ["posts", "toggle-like"],
    mutationFn: togglePostLike,
    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: ["posts", "infinite"],
        }),
        queryClient.cancelQueries({
          queryKey: ["posts", "liked", "ids"],
        }),
      ]);

      const previousPostQueries =
        queryClient.getQueriesData<PostsInfiniteData>({
          queryKey: ["posts", "infinite"],
        });
      const previousLikedIdQueries = queryClient.getQueriesData<number[]>({
        queryKey: ["posts", "liked", "ids"],
      });

      previousPostQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<PostsInfiniteData>(queryKey, (oldData) =>
          updatePostInInfiniteFeed(oldData, variables.postId, (post) => ({
            ...post,
            likedByMe: !variables.liked,
            likeCount: Math.max(
              0,
              post.likeCount + (variables.liked ? -1 : 1)
            ),
          }))
        );
      });

      previousLikedIdQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<number[]>(queryKey, (oldData) =>
          updateIdsArray(oldData, variables.postId, !variables.liked)
        );
      });

      return {
        previousPostQueries,
        previousLikedIdQueries,
      };
    },
    onError: (error, _variables, context) => {
      context?.previousPostQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousLikedIdQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });

      if (showToast) {
        showErrorToast("Gagal memperbarui like", {
          description: getErrorMessage(error, "Terjadi kesalahan saat like post."),
        });
      }
    },
    onSuccess: (result, variables) => {
      const nextLikedState = result.data.liked;
      const nextLikeCount = result.data.likeCount;

      queryClient
        .getQueriesData<PostsInfiniteData>({
          queryKey: ["posts", "infinite"],
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<PostsInfiniteData>(queryKey, (oldData) =>
            updatePostInInfiniteFeed(oldData, variables.postId, (post) => ({
              ...post,
              likedByMe: nextLikedState,
              likeCount: nextLikeCount,
            }))
          );
        });

      queryClient
        .getQueriesData<number[]>({
          queryKey: ["posts", "liked", "ids"],
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<number[]>(queryKey, (oldData) =>
            updateIdsArray(oldData, variables.postId, nextLikedState)
          );
        });

      if (showToast) {
        showSuccessToast(result.message);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts", "infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts", "liked", "ids"],
      });
    },
  });
}

export function useTogglePostSaveMutation(
  options: ToggleSaveMutationOptions = {}
) {
  const { showToast = true } = options;
  const queryClient = useQueryClient();

  return useMutation<
    TogglePostSaveSuccessResponse,
    unknown,
    TogglePostSaveVariables,
    TogglePostSaveContext
  >({
    mutationKey: ["posts", "toggle-save"],
    mutationFn: togglePostSave,
    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: ["posts", "infinite"],
        }),
        queryClient.cancelQueries({
          queryKey: ["posts", "saved", "ids"],
        }),
      ]);

      const previousPostQueries =
        queryClient.getQueriesData<PostsInfiniteData>({
          queryKey: ["posts", "infinite"],
        });
      const previousSavedIdQueries = queryClient.getQueriesData<number[]>({
        queryKey: ["posts", "saved", "ids"],
      });

      previousPostQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<PostsInfiniteData>(queryKey, (oldData) =>
          updatePostInInfiniteFeed(oldData, variables.postId, (post) => ({
            ...post,
            savedByMe: !variables.saved,
          }))
        );
      });

      previousSavedIdQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<number[]>(queryKey, (oldData) =>
          updateIdsArray(oldData, variables.postId, !variables.saved)
        );
      });

      return {
        previousPostQueries,
        previousSavedIdQueries,
      };
    },
    onError: (error, _variables, context) => {
      context?.previousPostQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousSavedIdQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });

      if (showToast) {
        showErrorToast("Gagal memperbarui simpan post", {
          description: getErrorMessage(
            error,
            "Terjadi kesalahan saat menyimpan postingan."
          ),
        });
      }
    },
    onSuccess: (result, variables) => {
      const nextSavedState = result.data.saved;

      queryClient
        .getQueriesData<PostsInfiniteData>({
          queryKey: ["posts", "infinite"],
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<PostsInfiniteData>(queryKey, (oldData) =>
            updatePostInInfiniteFeed(oldData, variables.postId, (post) => ({
              ...post,
              savedByMe: nextSavedState,
            }))
          );
        });

      queryClient
        .getQueriesData<number[]>({
          queryKey: ["posts", "saved", "ids"],
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<number[]>(queryKey, (oldData) =>
            updateIdsArray(oldData, variables.postId, nextSavedState)
          );
        });

      if (showToast) {
        showSuccessToast(result.message);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts", "infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts", "saved", "ids"],
      });
    },
  });
}

export function useToggleFollowMutation(
  options: ToggleFollowMutationOptions = {}
) {
  const { showToast = true } = options;
  const queryClient = useQueryClient();

  return useMutation<
    ToggleFollowSuccessResponse,
    unknown,
    ToggleFollowVariables,
    ToggleFollowContext
  >({
    mutationKey: ["follow", "toggle"],
    mutationFn: toggleFollow,
    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: ["posts", variables.postId, "likes", "infinite"],
        }),
        queryClient.cancelQueries({
          queryKey: ["me", "following", "ids"],
        }),
      ]);

      const previousPostLikesQueries =
        queryClient.getQueriesData<PostLikesInfiniteData>({
          queryKey: ["posts", variables.postId, "likes", "infinite"],
        });
      const previousFollowingIdQueries = queryClient.getQueriesData<number[]>({
        queryKey: ["me", "following", "ids"],
      });

      previousPostLikesQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<PostLikesInfiniteData>(queryKey, (oldData) =>
          updatePostLikesInInfiniteData(oldData, variables.userId, (user) => ({
            ...user,
            isFollowedByMe: !variables.following,
          }))
        );
      });

      previousFollowingIdQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<number[]>(queryKey, (oldData) =>
          updateIdsArray(oldData, variables.userId, !variables.following)
        );
      });

      return {
        previousPostLikesQueries,
        previousFollowingIdQueries,
      };
    },
    onError: (error, _variables, context) => {
      context?.previousPostLikesQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousFollowingIdQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });

      if (showToast) {
        showErrorToast("Gagal memperbarui follow", {
          description: getErrorMessage(
            error,
            "Terjadi kesalahan saat follow/unfollow user."
          ),
        });
      }
    },
    onSuccess: (result, variables) => {
      const isNowFollowing = result.data.following;

      queryClient
        .getQueriesData<PostLikesInfiniteData>({
          queryKey: ["posts", variables.postId, "likes", "infinite"],
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<PostLikesInfiniteData>(queryKey, (oldData) =>
            updatePostLikesInInfiniteData(oldData, variables.userId, (user) => ({
              ...user,
              isFollowedByMe: isNowFollowing,
            }))
          );
        });

      queryClient
        .getQueriesData<number[]>({
          queryKey: ["me", "following", "ids"],
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<number[]>(queryKey, (oldData) =>
            updateIdsArray(oldData, variables.userId, isNowFollowing)
          );
        });

      if (showToast) {
        showSuccessToast(result.message);
      }
    },
    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["posts", variables.postId, "likes", "infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["me", "following", "ids"],
      });
    },
  });
}
