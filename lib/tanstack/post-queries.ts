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
import { clearAuthSession, getAuthSession } from "@/lib/auth-session";

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

type PostDetailData = PostItem;

export type PostDetailSuccessResponse = {
  success: true;
  message: string;
  data: PostDetailData;
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

type MyPostsData = {
  items: PostItem[];
  pagination: PostsPagination;
};

export type MyPostsSuccessResponse = {
  success: true;
  message: string;
  data: MyPostsData;
};

export type MyProfile = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string | null;
  avatarUrl: string | null;
};

type MyProfileData = {
  profile: MyProfile;
  stats: {
    posts: number;
    followers: number;
    following: number;
    likes: number;
  };
};

export type MyProfileSuccessResponse = {
  success: true;
  message: string;
  data: MyProfileData;
};

export type UserProfile = {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  email: string;
  phone: string;
  counts: {
    post: number;
    followers: number;
    following: number;
    likes: number;
  };
  isFollowing: boolean;
  isMe: boolean;
};

type UserProfileData = UserProfile;

export type UserProfileSuccessResponse = {
  success: true;
  message: string;
  data: UserProfileData;
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

type UserPostsData = {
  posts: PostItem[];
  pagination: PostsPagination;
};

export type UserPostsSuccessResponse = {
  success: true;
  message: string;
  data: UserPostsData;
};

type UserLikedPostsData = {
  posts: PostItem[];
  pagination: PostsPagination;
};

export type UserLikedPostsSuccessResponse = {
  success: true;
  message: string;
  data: UserLikedPostsData;
};

export type SavedPostItem = {
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

export type FollowUserItem = {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
};

type FollowUsersData = {
  users: FollowUserItem[];
  pagination: PostsPagination;
};

type MyFollowingData = FollowUsersData;

export type MyFollowingSuccessResponse = {
  success: true;
  message: string;
  data: MyFollowingData;
};

type MyFollowersData = FollowUsersData;

export type MyFollowersSuccessResponse = {
  success: true;
  message: string;
  data: MyFollowersData;
};

type UserFollowingData = FollowUsersData;

export type UserFollowingSuccessResponse = {
  success: true;
  message: string;
  data: UserFollowingData;
};

type UserFollowersData = FollowUsersData;

export type UserFollowersSuccessResponse = {
  success: true;
  message: string;
  data: UserFollowersData;
};

type UserSearchData = FollowUsersData;

export type UserSearchSuccessResponse = {
  success: true;
  message: string;
  data: UserSearchData;
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

export type PostCommentAuthor = {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
};

export type PostCommentItem = {
  id: number;
  text: string;
  createdAt: string;
  author: PostCommentAuthor;
  isMine?: boolean;
};

type PostCommentsData = {
  comments: PostCommentItem[];
  pagination: PostsPagination;
};

export type PostCommentsSuccessResponse = {
  success: true;
  message: string;
  data: PostCommentsData;
};

type CreatePostCommentData = PostCommentItem;

type CreatePostCommentSuccessResponse = {
  success: true;
  message: string;
  data: CreatePostCommentData;
};

type CreatePostData = PostItem;

type CreatePostSuccessResponse = {
  success: true;
  message: string;
  data: CreatePostData;
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
  previousPostDetailQueries: Array<
    [QueryKey, PostDetailSuccessResponse | undefined]
  >;
};

type TogglePostSaveVariables = {
  postId: number;
  saved: boolean;
};

type TogglePostSaveContext = {
  previousPostQueries: Array<[QueryKey, PostsInfiniteData | undefined]>;
  previousSavedIdQueries: Array<[QueryKey, number[] | undefined]>;
  previousPostDetailQueries: Array<
    [QueryKey, PostDetailSuccessResponse | undefined]
  >;
};

type ToggleFollowVariables = {
  postId?: number;
  userId: number;
  username: string;
  following: boolean;
};

type CreatePostCommentVariables = {
  postId: number;
  text: string;
};

type CreatePostVariables = {
  caption: string;
  image: File;
};

type ToggleFollowContext = {
  hasValidPostId: boolean;
  optimisticFollowingDelta: number;
  optimisticFollowersDelta: number;
  previousPostLikesQueries: Array<[QueryKey, PostLikesInfiniteData | undefined]>;
  previousFollowingIdQueries: Array<[QueryKey, number[] | undefined]>;
  previousProfileQueries: Array<[QueryKey, MyProfileSuccessResponse | undefined]>;
  previousUserProfileQueries: Array<[QueryKey, UserProfileSuccessResponse | undefined]>;
  previousFollowingQueries: Array<[QueryKey, MyFollowingInfiniteData | undefined]>;
  previousFollowersQueries: Array<[QueryKey, MyFollowersInfiniteData | undefined]>;
  previousUsersConnectionsQueries: Array<
    [QueryKey, UsersConnectionsInfiniteData | undefined]
  >;
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

type CreateCommentMutationOptions = {
  showToast?: boolean;
  invalidatePosts?: boolean;
};

type CreatePostMutationOptions = {
  showToast?: boolean;
  invalidatePosts?: boolean;
};

type RequestApiInit = RequestInit & {
  cache?: RequestCache;
};

type RequestApiOptions = {
  includeAuthWhenAvailable?: boolean;
  redirectOnUnauthorized?: boolean;
  requireAuth?: boolean;
};

export const postQueryKeys = {
  feedInfinite: (limit = 20) => ["posts", "infinite", limit] as const,
  likedPostIds: (limit = 50) => ["posts", "liked", "ids", limit] as const,
  savedPostIds: (limit = 50) => ["posts", "saved", "ids", limit] as const,
  meProfile: () => ["me", "profile"] as const,
  userProfile: (username: string) =>
    ["users", username.trim(), "profile"] as const,
  myPostsInfinite: (limit = 9) => ["me", "posts", "infinite", limit] as const,
  mySavedPostsInfinite: (limit = 9) =>
    ["me", "saved", "infinite", limit] as const,
  userPostsInfinite: (username: string, limit = 9) =>
    ["users", username.trim(), "posts", "infinite", limit] as const,
  userLikesInfinite: (username: string, limit = 9) =>
    ["users", username.trim(), "likes", "infinite", limit] as const,
  userFollowingInfinite: (username: string, limit = 10) =>
    ["users", username.trim(), "following", "infinite", limit] as const,
  userFollowersInfinite: (username: string, limit = 10) =>
    ["users", username.trim(), "followers", "infinite", limit] as const,
  userSearchInfinite: (query: string, limit = 20) =>
    ["users", "search", query.trim(), "infinite", limit] as const,
  myFollowingInfinite: (limit = 10) =>
    ["me", "following", "infinite", limit] as const,
  myFollowersInfinite: (limit = 10) =>
    ["me", "followers", "infinite", limit] as const,
  postDetail: (postId: number) => ["posts", postId, "detail"] as const,
  postLikesInfinite: (postId: number, limit = 20) =>
    ["posts", postId, "likes", "infinite", limit] as const,
  postComments: (postId: number, page = 1, limit = 10) =>
    ["posts", postId, "comments", page, limit] as const,
  postCommentsList: (postId: number) => ["posts", postId, "comments"] as const,
  followingUserIds: (limit = 50) => ["me", "following", "ids", limit] as const,
};

type PostsInfiniteData = InfiniteData<PostsSuccessResponse, number>;
type MyFollowingInfiniteData = InfiniteData<MyFollowingSuccessResponse, number>;
type MyFollowersInfiniteData = InfiniteData<MyFollowersSuccessResponse, number>;
type UsersConnectionsInfiniteData = InfiniteData<
  {
    success: true;
    message: string;
    data: FollowUsersData;
  },
  number
>;
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

const AUTH_REDIRECT_STATUSES = new Set([401, 403]);
let hasTriggeredAuthRedirect = false;

function redirectToLoginIfUnauthorized(status: number) {
  if (!AUTH_REDIRECT_STATUSES.has(status) || typeof window === "undefined") {
    return;
  }

  if (window.location.pathname === "/login" || hasTriggeredAuthRedirect) {
    return;
  }

  hasTriggeredAuthRedirect = true;
  clearAuthSession();
  window.location.assign("/login");
}

async function requestApi<TData>(
  endpoint: string,
  init: RequestApiInit,
  fallbackMessage: string,
  options: RequestApiOptions = {}
): Promise<{
  success: true;
  message: string;
  data: TData;
}> {
  const {
    includeAuthWhenAvailable = true,
    redirectOnUnauthorized = true,
    requireAuth = true,
  } = options;
  const token = getAuthSession()?.token ?? null;

  if (requireAuth && !token) {
    if (redirectOnUnauthorized) {
      redirectToLoginIfUnauthorized(401);
    }

    throw new ApiError("Unauthorized", 401);
  }

  const headers = new Headers(init.headers);
  headers.set("accept", "*/*");

  if (includeAuthWhenAvailable && token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });

  const body = await parseApiBody<ApiResponse<TData>>(response);
  if (!response.ok || !body?.success || !body.data) {
    if (redirectOnUnauthorized) {
      redirectToLoginIfUnauthorized(response.status);
    }

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
    "Failed to fetch posts",
    {
      requireAuth: false,
    }
  );
}

async function fetchMyProfile(): Promise<MyProfileSuccessResponse> {
  return requestApi<MyProfileData>(
    "/api/me",
    {
      method: "GET",
    },
    "Failed to fetch profile"
  );
}

async function fetchUserProfile(
  username: string
): Promise<UserProfileSuccessResponse> {
  return requestApi<UserProfileData>(
    `/api/users/${encodeURIComponent(username)}`,
    {
      method: "GET",
    },
    "Failed to fetch user profile"
  );
}

async function fetchMyPosts({
  page,
  limit,
}: FetchCollectionParams): Promise<MyPostsSuccessResponse> {
  return requestApi<MyPostsData>(
    `/api/me/posts?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch my posts"
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

async function fetchUserPosts({
  username,
  page,
  limit,
}: FetchCollectionParams & {
  username: string;
}): Promise<UserPostsSuccessResponse> {
  return requestApi<UserPostsData>(
    `/api/users/${encodeURIComponent(username)}/posts?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch user posts"
  );
}

async function fetchUserLikedPosts({
  username,
  page,
  limit,
}: FetchCollectionParams & {
  username: string;
}): Promise<UserLikedPostsSuccessResponse> {
  return requestApi<UserLikedPostsData>(
    `/api/users/${encodeURIComponent(username)}/likes?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch user liked posts"
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

async function fetchMyFollowers({
  page,
  limit,
}: FetchCollectionParams): Promise<MyFollowersSuccessResponse> {
  return requestApi<MyFollowersData>(
    `/api/me/followers?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch followers"
  );
}

async function fetchUserFollowing({
  username,
  page,
  limit,
}: FetchCollectionParams & {
  username: string;
}): Promise<UserFollowingSuccessResponse> {
  return requestApi<UserFollowingData>(
    `/api/users/${encodeURIComponent(username)}/following?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch user following"
  );
}

async function fetchUserFollowers({
  username,
  page,
  limit,
}: FetchCollectionParams & {
  username: string;
}): Promise<UserFollowersSuccessResponse> {
  return requestApi<UserFollowersData>(
    `/api/users/${encodeURIComponent(username)}/followers?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch user followers"
  );
}

async function fetchUserSearch({
  query,
  page,
  limit,
}: FetchCollectionParams & {
  query: string;
}): Promise<UserSearchSuccessResponse> {
  return requestApi<UserSearchData>(
    `/api/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to search users",
    {
      includeAuthWhenAvailable: true,
      redirectOnUnauthorized: false,
      requireAuth: false,
    }
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

async function fetchPostDetail(postId: number): Promise<PostDetailSuccessResponse> {
  return requestApi<PostDetailData>(
    `/api/posts/${postId}`,
    {
      method: "GET",
    },
    "Failed to fetch post detail"
  );
}

async function fetchPostComments({
  postId,
  page,
  limit,
}: FetchCollectionParams & {
  postId: number;
}): Promise<PostCommentsSuccessResponse> {
  return requestApi<PostCommentsData>(
    `/api/posts/${postId}/comments?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
    "Failed to fetch post comments"
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

async function createPostComment({
  postId,
  text,
}: CreatePostCommentVariables): Promise<CreatePostCommentSuccessResponse> {
  return requestApi<CreatePostCommentData>(
    `/api/posts/${postId}/comments`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    },
    "Failed to create comment"
  );
}

async function createPost({
  caption,
  image,
}: CreatePostVariables): Promise<CreatePostSuccessResponse> {
  const formData = new FormData();
  formData.set("caption", caption.trim());
  formData.set("image", image, image.name);

  return requestApi<CreatePostData>(
    "/api/posts",
    {
      method: "POST",
      body: formData,
    },
    "Failed to create post"
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

function updatePostDetailData(
  source: PostDetailSuccessResponse | undefined,
  updater: (post: PostItem) => PostItem
) {
  if (!source) {
    return source;
  }

  return {
    ...source,
    data: updater(source.data),
  };
}

function prependPostToInfiniteFeed(
  source: PostsInfiniteData | undefined,
  post: PostItem
) {
  if (!source || source.pages.length === 0) {
    return source;
  }

  const isPostAlreadyInFeed = source.pages.some((page) =>
    page.data.posts.some((item) => item.id === post.id)
  );

  const currentTotal = source.pages[0]?.data.pagination.total ?? 0;
  const nextTotal = isPostAlreadyInFeed ? currentTotal : currentTotal + 1;

  return {
    ...source,
    pages: source.pages.map((page, pageIndex) => {
      const nextPosts =
        pageIndex === 0
          ? [post, ...page.data.posts.filter((item) => item.id !== post.id)]
          : page.data.posts.filter((item) => item.id !== post.id);

      const nextTotalPages =
        page.data.pagination.limit > 0
          ? Math.max(
              page.data.pagination.totalPages,
              Math.ceil(nextTotal / page.data.pagination.limit)
            )
          : page.data.pagination.totalPages;

      return {
        ...page,
        data: {
          ...page.data,
          posts: nextPosts,
          pagination: {
            ...page.data.pagination,
            total: nextTotal,
            totalPages: nextTotalPages,
          },
        },
      };
    }),
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

function updateUsersInInfiniteData<
  TPageData extends {
    data: {
      users: FollowUserItem[];
      pagination: PostsPagination;
    };
  },
>(
  source: InfiniteData<TPageData, number> | undefined,
  userId: number,
  updater: (user: FollowUserItem) => FollowUserItem
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

function removeUserFromUsersInfiniteData<
  TPageData extends {
    data: {
      users: FollowUserItem[];
      pagination: PostsPagination;
    };
  },
>(
  source: InfiniteData<TPageData, number> | undefined,
  userId: number
) {
  if (!source) {
    return source;
  }

  const hasUser = source.pages.some((page) =>
    page.data.users.some((user) => user.id === userId)
  );
  if (!hasUser) {
    return source;
  }

  return {
    ...source,
    pages: source.pages.map((page) => {
      const nextTotal = Math.max(0, page.data.pagination.total - 1);
      const nextTotalPages =
        page.data.pagination.limit > 0
          ? Math.max(1, Math.ceil(nextTotal / page.data.pagination.limit))
          : page.data.pagination.totalPages;

      return {
        ...page,
        data: {
          ...page.data,
          users: page.data.users.filter((user) => user.id !== userId),
          pagination: {
            ...page.data.pagination,
            total: nextTotal,
            totalPages: nextTotalPages,
          },
        },
      };
    }),
  };
}

function adjustFollowingCountInProfile(
  source: MyProfileSuccessResponse | undefined,
  delta: number
) {
  if (!source || delta === 0) {
    return source;
  }

  return {
    ...source,
    data: {
      ...source.data,
      stats: {
        ...source.data.stats,
        following: Math.max(0, source.data.stats.following + delta),
      },
    },
  };
}

function adjustFollowersStateInUserProfile(
  source: UserProfileSuccessResponse | undefined,
  nextFollowingState: boolean,
  delta: number
) {
  if (!source) {
    return source;
  }

  return {
    ...source,
    data: {
      ...source.data,
      isFollowing: source.data.isMe ? source.data.isFollowing : nextFollowingState,
      counts: {
        ...source.data.counts,
        followers: source.data.isMe
          ? source.data.counts.followers
          : Math.max(0, source.data.counts.followers + delta),
      },
    },
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

function getFeedLimitFromQueryKey(queryKey: QueryKey, fallback = 20) {
  if (!Array.isArray(queryKey)) {
    return fallback;
  }

  const limit = queryKey[2];
  if (typeof limit !== "number" || !Number.isFinite(limit) || limit < 1) {
    return fallback;
  }

  return limit;
}

function isUsersConnectionInfiniteQueryKey(queryKey: QueryKey) {
  if (!Array.isArray(queryKey) || queryKey[0] !== "users") {
    return false;
  }

  if (!queryKey.includes("infinite")) {
    return false;
  }

  return (
    queryKey[1] === "search" ||
    queryKey.includes("followers") ||
    queryKey.includes("following")
  );
}

function createSeededFeedData(
  post: PostItem,
  message: string,
  limit = 20
): PostsInfiniteData {
  return {
    pages: [
      {
        success: true,
        message,
        data: {
          posts: [post],
          pagination: {
            page: 1,
            limit,
            total: 1,
            totalPages: 1,
          },
        },
      },
    ],
    pageParams: [1],
  };
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

export function useMyProfileQuery(enabled = true) {
  return useQuery({
    queryKey: postQueryKeys.meProfile(),
    queryFn: fetchMyProfile,
    enabled,
  });
}

export function useUserProfileQuery(username: string, enabled = true) {
  const normalizedUsername = username.trim();

  return useQuery({
    queryKey: postQueryKeys.userProfile(normalizedUsername),
    queryFn: () => fetchUserProfile(normalizedUsername),
    enabled: enabled && normalizedUsername.length > 0,
  });
}

export function useMyPostsInfiniteQuery(limit = 9, enabled = true) {
  return useInfiniteQuery({
    queryKey: postQueryKeys.myPostsInfinite(limit),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchMyPosts({
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
    enabled,
  });
}

export function useMySavedPostsInfiniteQuery(limit = 9, enabled = true) {
  return useInfiniteQuery({
    queryKey: postQueryKeys.mySavedPostsInfinite(limit),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchMySavedPosts({
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
    enabled,
  });
}

export function useUserPostsInfiniteQuery(
  username: string,
  limit = 9,
  enabled = true
) {
  const normalizedUsername = username.trim();

  return useInfiniteQuery({
    queryKey: postQueryKeys.userPostsInfinite(normalizedUsername, limit),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchUserPosts({
        username: normalizedUsername,
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
    enabled: enabled && normalizedUsername.length > 0,
  });
}

export function useUserLikedPostsInfiniteQuery(
  username: string,
  limit = 9,
  enabled = true
) {
  const normalizedUsername = username.trim();

  return useInfiniteQuery({
    queryKey: postQueryKeys.userLikesInfinite(normalizedUsername, limit),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchUserLikedPosts({
        username: normalizedUsername,
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
    enabled: enabled && normalizedUsername.length > 0,
  });
}

export function useUserFollowingInfiniteQuery(
  username: string,
  limit = 10,
  enabled = true
) {
  const normalizedUsername = username.trim();

  return useInfiniteQuery({
    queryKey: postQueryKeys.userFollowingInfinite(normalizedUsername, limit),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchUserFollowing({
        username: normalizedUsername,
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
    enabled: enabled && normalizedUsername.length > 0,
  });
}

export function useUserFollowersInfiniteQuery(
  username: string,
  limit = 10,
  enabled = true
) {
  const normalizedUsername = username.trim();

  return useInfiniteQuery({
    queryKey: postQueryKeys.userFollowersInfinite(normalizedUsername, limit),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchUserFollowers({
        username: normalizedUsername,
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
    enabled: enabled && normalizedUsername.length > 0,
  });
}

export function useUserSearchInfiniteQuery(
  query: string,
  limit = 20,
  enabled = true
) {
  const normalizedQuery = query.trim();

  return useInfiniteQuery({
    queryKey: postQueryKeys.userSearchInfinite(normalizedQuery, limit),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchUserSearch({
        query: normalizedQuery,
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
    enabled: enabled && normalizedQuery.length > 0,
  });
}

export function useMyFollowingInfiniteQuery(limit = 10, enabled = true) {
  return useInfiniteQuery({
    queryKey: postQueryKeys.myFollowingInfinite(limit),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchMyFollowing({
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
    enabled,
  });
}

export function useMyFollowersInfiniteQuery(limit = 10, enabled = true) {
  return useInfiniteQuery({
    queryKey: postQueryKeys.myFollowersInfinite(limit),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchMyFollowers({
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
    enabled,
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

export function usePostDetailQuery(postId: number, enabled = true) {
  return useQuery({
    queryKey: postQueryKeys.postDetail(postId),
    queryFn: () => fetchPostDetail(postId),
    enabled: enabled && postId > 0,
    refetchOnMount: "always",
  });
}

export function usePostCommentsQuery(
  postId: number,
  page = 1,
  limit = 10,
  enabled = true
) {
  return useQuery({
    queryKey: postQueryKeys.postComments(postId, page, limit),
    queryFn: () =>
      fetchPostComments({
        postId,
        page,
        limit,
      }),
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
        queryClient.cancelQueries({
          queryKey: postQueryKeys.postDetail(variables.postId),
        }),
      ]);

      const previousPostQueries =
        queryClient.getQueriesData<PostsInfiniteData>({
          queryKey: ["posts", "infinite"],
        });
      const previousLikedIdQueries = queryClient.getQueriesData<number[]>({
        queryKey: ["posts", "liked", "ids"],
      });
      const previousPostDetailQueries =
        queryClient.getQueriesData<PostDetailSuccessResponse>({
          queryKey: postQueryKeys.postDetail(variables.postId),
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

      previousPostDetailQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<PostDetailSuccessResponse>(queryKey, (oldData) =>
          updatePostDetailData(oldData, (post) => ({
            ...post,
            likedByMe: !variables.liked,
            likeCount: Math.max(0, post.likeCount + (variables.liked ? -1 : 1)),
          }))
        );
      });

      return {
        previousPostQueries,
        previousLikedIdQueries,
        previousPostDetailQueries,
      };
    },
    onError: (error, _variables, context) => {
      context?.previousPostQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousLikedIdQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousPostDetailQueries.forEach(([queryKey, oldData]) => {
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

      queryClient
        .getQueriesData<PostDetailSuccessResponse>({
          queryKey: postQueryKeys.postDetail(variables.postId),
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<PostDetailSuccessResponse>(queryKey, (oldData) =>
            updatePostDetailData(oldData, (post) => ({
              ...post,
              likedByMe: nextLikedState,
              likeCount: nextLikeCount,
            }))
          );
        });

      if (showToast) {
        showSuccessToast(result.message);
      }
    },
    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["posts", "infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts", "liked", "ids"],
      });
      queryClient.invalidateQueries({
        queryKey: postQueryKeys.postDetail(variables.postId),
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
        queryClient.cancelQueries({
          queryKey: postQueryKeys.postDetail(variables.postId),
        }),
      ]);

      const previousPostQueries =
        queryClient.getQueriesData<PostsInfiniteData>({
          queryKey: ["posts", "infinite"],
        });
      const previousSavedIdQueries = queryClient.getQueriesData<number[]>({
        queryKey: ["posts", "saved", "ids"],
      });
      const previousPostDetailQueries =
        queryClient.getQueriesData<PostDetailSuccessResponse>({
          queryKey: postQueryKeys.postDetail(variables.postId),
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

      previousPostDetailQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<PostDetailSuccessResponse>(queryKey, (oldData) =>
          updatePostDetailData(oldData, (post) => ({
            ...post,
            savedByMe: !variables.saved,
          }))
        );
      });

      return {
        previousPostQueries,
        previousSavedIdQueries,
        previousPostDetailQueries,
      };
    },
    onError: (error, _variables, context) => {
      context?.previousPostQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousSavedIdQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousPostDetailQueries.forEach(([queryKey, oldData]) => {
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

      queryClient
        .getQueriesData<PostDetailSuccessResponse>({
          queryKey: postQueryKeys.postDetail(variables.postId),
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<PostDetailSuccessResponse>(queryKey, (oldData) =>
            updatePostDetailData(oldData, (post) => ({
              ...post,
              savedByMe: nextSavedState,
            }))
          );
        });

      if (showToast) {
        showSuccessToast(result.message);
      }
    },
    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["posts", "infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts", "saved", "ids"],
      });
      queryClient.invalidateQueries({
        queryKey: postQueryKeys.postDetail(variables.postId),
      });
    },
  });
}

export function useCreatePostCommentMutation(
  options: CreateCommentMutationOptions = {}
) {
  const { showToast = false, invalidatePosts = true } = options;
  const queryClient = useQueryClient();

  return useMutation<CreatePostCommentSuccessResponse, unknown, CreatePostCommentVariables>(
    {
      mutationKey: ["posts", "comments", "create"],
      mutationFn: createPostComment,
      onError: (error) => {
        if (showToast) {
          showErrorToast("Gagal menambahkan komentar", {
            description: getErrorMessage(
              error,
              "Terjadi kesalahan saat menambahkan komentar."
            ),
          });
        }
      },
      onSuccess: (result) => {
        if (showToast) {
          showSuccessToast(result.message);
        }
      },
      onSettled: (_result, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: postQueryKeys.postCommentsList(variables.postId),
        });
        queryClient.invalidateQueries({
          queryKey: postQueryKeys.postDetail(variables.postId),
        });

        if (invalidatePosts) {
          queryClient.invalidateQueries({
            queryKey: ["posts", "infinite"],
          });
        }
      },
    }
  );
}

export function useCreatePostMutation(
  options: CreatePostMutationOptions = {}
) {
  const { showToast = false, invalidatePosts = true } = options;
  const queryClient = useQueryClient();

  return useMutation<CreatePostSuccessResponse, unknown, CreatePostVariables>({
    mutationKey: ["posts", "create"],
    mutationFn: createPost,
    onError: (error) => {
      if (showToast) {
        showErrorToast("Gagal membuat post", {
          description: getErrorMessage(
            error,
            "Terjadi kesalahan saat membuat postingan."
          ),
        });
      }
    },
    onSuccess: (result) => {
      const feedQueries = queryClient.getQueriesData<PostsInfiniteData>({
        queryKey: ["posts", "infinite"],
      });

      if (feedQueries.length === 0) {
        queryClient.setQueryData<PostsInfiniteData>(
          postQueryKeys.feedInfinite(20),
          createSeededFeedData(result.data, result.message, 20)
        );
      }

      feedQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<PostsInfiniteData>(queryKey, (oldData) => {
          if (!oldData) {
            return createSeededFeedData(
              result.data,
              result.message,
              getFeedLimitFromQueryKey(queryKey, 20)
            );
          }

          return prependPostToInfiniteFeed(oldData, result.data);
        });
      });

      if (showToast) {
        showSuccessToast(result.message);
      }
    },
    onSettled: () => {
      if (!invalidatePosts) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["posts", "infinite"],
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
      const hasValidPostId =
        typeof variables.postId === "number" && variables.postId > 0;
      const optimisticFollowingState = !variables.following;
      const optimisticFollowingDelta = variables.following ? -1 : 1;
      const optimisticFollowersDelta = variables.following ? -1 : 1;

      const cancelQueriesTasks = [
        queryClient.cancelQueries({
          queryKey: ["me", "following", "ids"],
        }),
        queryClient.cancelQueries({
          queryKey: postQueryKeys.meProfile(),
        }),
        queryClient.cancelQueries({
          queryKey: postQueryKeys.userProfile(variables.username),
        }),
        queryClient.cancelQueries({
          queryKey: ["me", "following", "infinite"],
        }),
        queryClient.cancelQueries({
          queryKey: ["me", "followers", "infinite"],
        }),
        queryClient.cancelQueries({
          predicate: (query) =>
            isUsersConnectionInfiniteQueryKey(query.queryKey),
        }),
      ];

      if (hasValidPostId) {
        cancelQueriesTasks.push(
          queryClient.cancelQueries({
            queryKey: ["posts", variables.postId, "likes", "infinite"],
          })
        );
      }

      await Promise.all(cancelQueriesTasks);

      const previousPostLikesQueries = hasValidPostId
        ? queryClient.getQueriesData<PostLikesInfiniteData>({
            queryKey: ["posts", variables.postId, "likes", "infinite"],
          })
        : [];
      const previousFollowingIdQueries = queryClient.getQueriesData<number[]>({
        queryKey: ["me", "following", "ids"],
      });
      const previousProfileQueries =
        queryClient.getQueriesData<MyProfileSuccessResponse>({
          queryKey: postQueryKeys.meProfile(),
        });
      const previousUserProfileQueries =
        queryClient.getQueriesData<UserProfileSuccessResponse>({
          queryKey: postQueryKeys.userProfile(variables.username),
        });
      const previousFollowingQueries =
        queryClient.getQueriesData<MyFollowingInfiniteData>({
          queryKey: ["me", "following", "infinite"],
        });
      const previousFollowersQueries =
        queryClient.getQueriesData<MyFollowersInfiniteData>({
          queryKey: ["me", "followers", "infinite"],
        });
      const previousUsersConnectionsQueries = queryClient
        .getQueriesData<UsersConnectionsInfiniteData>({
          queryKey: ["users"],
        })
        .filter(([queryKey]) => isUsersConnectionInfiniteQueryKey(queryKey));

      if (hasValidPostId) {
        previousPostLikesQueries.forEach(([queryKey]) => {
          queryClient.setQueryData<PostLikesInfiniteData>(queryKey, (oldData) =>
            updatePostLikesInInfiniteData(oldData, variables.userId, (user) => ({
              ...user,
              isFollowedByMe: optimisticFollowingState,
            }))
          );
        });
      }

      previousFollowingIdQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<number[]>(queryKey, (oldData) =>
          updateIdsArray(oldData, variables.userId, optimisticFollowingState)
        );
      });

      previousProfileQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<MyProfileSuccessResponse>(queryKey, (oldData) =>
          adjustFollowingCountInProfile(oldData, optimisticFollowingDelta)
        );
      });

      previousUserProfileQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<UserProfileSuccessResponse>(queryKey, (oldData) =>
          adjustFollowersStateInUserProfile(
            oldData,
            optimisticFollowingState,
            optimisticFollowersDelta
          )
        );
      });

      previousFollowingQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<MyFollowingInfiniteData>(queryKey, (oldData) => {
          const updatedFollowingUsers = updateUsersInInfiniteData(
            oldData,
            variables.userId,
            (user) => ({
              ...user,
              isFollowedByMe: optimisticFollowingState,
            })
          );

          if (!optimisticFollowingState) {
            return removeUserFromUsersInfiniteData(
              updatedFollowingUsers,
              variables.userId
            );
          }

          return updatedFollowingUsers;
        });
      });

      previousFollowersQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<MyFollowersInfiniteData>(queryKey, (oldData) =>
          updateUsersInInfiniteData(oldData, variables.userId, (user) => ({
            ...user,
            isFollowedByMe: optimisticFollowingState,
          }))
        );
      });

      previousUsersConnectionsQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<UsersConnectionsInfiniteData>(queryKey, (oldData) =>
          updateUsersInInfiniteData(oldData, variables.userId, (user) => ({
            ...user,
            isFollowedByMe: optimisticFollowingState,
          }))
        );
      });

      return {
        hasValidPostId,
        optimisticFollowingDelta,
        optimisticFollowersDelta,
        previousPostLikesQueries,
        previousFollowingIdQueries,
        previousProfileQueries,
        previousUserProfileQueries,
        previousFollowingQueries,
        previousFollowersQueries,
        previousUsersConnectionsQueries,
      };
    },
    onError: (error, _variables, context) => {
      context?.previousPostLikesQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousFollowingIdQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousProfileQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousUserProfileQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousFollowingQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousFollowersQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
      context?.previousUsersConnectionsQueries.forEach(([queryKey, oldData]) => {
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
    onSuccess: (result, variables, context) => {
      const isNowFollowing = result.data.following;

      if (context?.hasValidPostId) {
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
      }

      queryClient
        .getQueriesData<number[]>({
          queryKey: ["me", "following", "ids"],
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<number[]>(queryKey, (oldData) =>
            updateIdsArray(oldData, variables.userId, isNowFollowing)
          );
        });

      queryClient
        .getQueriesData<MyFollowingInfiniteData>({
          queryKey: ["me", "following", "infinite"],
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<MyFollowingInfiniteData>(queryKey, (oldData) => {
            const updatedFollowingUsers = updateUsersInInfiniteData(
              oldData,
              variables.userId,
              (user) => ({
                ...user,
                isFollowedByMe: isNowFollowing,
              })
            );

            if (!isNowFollowing) {
              return removeUserFromUsersInfiniteData(
                updatedFollowingUsers,
                variables.userId
              );
            }

            return updatedFollowingUsers;
          });
        });

      queryClient
        .getQueriesData<MyFollowersInfiniteData>({
          queryKey: ["me", "followers", "infinite"],
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<MyFollowersInfiniteData>(queryKey, (oldData) =>
            updateUsersInInfiniteData(oldData, variables.userId, (user) => ({
              ...user,
              isFollowedByMe: isNowFollowing,
            }))
          );
        });

      queryClient
        .getQueriesData<UsersConnectionsInfiniteData>({
          queryKey: ["users"],
        })
        .filter(([queryKey]) => isUsersConnectionInfiniteQueryKey(queryKey))
        .forEach(([queryKey]) => {
          queryClient.setQueryData<UsersConnectionsInfiniteData>(queryKey, (oldData) =>
            updateUsersInInfiniteData(oldData, variables.userId, (user) => ({
              ...user,
              isFollowedByMe: isNowFollowing,
            }))
          );
        });

      const actualFollowingDelta =
        variables.following === isNowFollowing ? 0 : isNowFollowing ? 1 : -1;
      const correctionDelta =
        actualFollowingDelta - (context?.optimisticFollowingDelta ?? 0);
      const followersCorrectionDelta =
        actualFollowingDelta - (context?.optimisticFollowersDelta ?? 0);

      if (correctionDelta !== 0) {
        queryClient
          .getQueriesData<MyProfileSuccessResponse>({
            queryKey: postQueryKeys.meProfile(),
          })
          .forEach(([queryKey]) => {
            queryClient.setQueryData<MyProfileSuccessResponse>(
              queryKey,
              (oldData) =>
                adjustFollowingCountInProfile(oldData, correctionDelta)
            );
          });
      }

      queryClient
        .getQueriesData<UserProfileSuccessResponse>({
          queryKey: postQueryKeys.userProfile(variables.username),
        })
        .forEach(([queryKey]) => {
          queryClient.setQueryData<UserProfileSuccessResponse>(
            queryKey,
            (oldData) =>
              adjustFollowersStateInUserProfile(
                oldData,
                isNowFollowing,
                followersCorrectionDelta
              )
          );
        });

      if (showToast) {
        showSuccessToast(result.message);
      }
    },
    onSettled: (_result, _error, variables, context) => {
      if (context?.hasValidPostId) {
        queryClient.invalidateQueries({
          queryKey: ["posts", variables.postId, "likes", "infinite"],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["me", "following", "ids"],
      });
      queryClient.invalidateQueries({
        queryKey: postQueryKeys.meProfile(),
      });
      queryClient.invalidateQueries({
        queryKey: postQueryKeys.userProfile(variables.username),
      });
      queryClient.invalidateQueries({
        queryKey: ["me", "following", "infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["me", "followers", "infinite"],
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          isUsersConnectionInfiniteQueryKey(query.queryKey),
      });
    },
  });
}
