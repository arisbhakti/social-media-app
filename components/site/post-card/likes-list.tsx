"use client";

import { useEffect, useMemo, useRef } from "react";

import {
  ApiError,
  useMyFollowingUserIdsQuery,
  usePostLikesInfiniteQuery,
  useToggleFollowMutation,
} from "@/lib/tanstack/post-queries";
import { FollowUserButton } from "@/components/site/post-card/follow-user-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type LikesListProps = {
  postId: number;
};

function LikesListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`likes-list-skeleton-${index}`}
          className="flex items-center justify-between gap-3 rounded-[14px] py-1.5"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="size-12 rounded-full" />
            <div className="grid gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function LikesList({ postId }: LikesListProps) {
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = usePostLikesInfiniteQuery(postId, 20, Boolean(postId));
  const { data: followingUserIds } = useMyFollowingUserIdsQuery(
    50,
    Boolean(postId),
  );
  const toggleFollowMutation = useToggleFollowMutation();

  const followingUserIdsSet = useMemo(
    () => new Set(followingUserIds ?? []),
    [followingUserIds],
  );

  const users = useMemo(
    () =>
      data?.pages.flatMap((page) =>
        page.data.users.map((user) => ({
          ...user,
          isFollowedByMe: followingUserIds
            ? followingUserIdsSet.has(user.id)
            : user.isFollowedByMe,
        })),
      ) ?? [],
    [data, followingUserIds, followingUserIdsSet],
  );

  const isFollowPending = toggleFollowMutation.isPending;
  const activeFollowUserId = toggleFollowMutation.variables?.userId;

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    const root = listContainerRef.current;
    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        fetchNextPage();
      },
      {
        root,
        rootMargin: "220px 0px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Gagal memuat daftar likes";

  if (isLoading) {
    return (
      <div className="flex flex-col overflow-hidden bg-neutral-950 text-neutral-25">
        <div className="md:px-6 md:pt-6 md:pb-0">
          <h2 className="text-md md:text-xl font-bold">Likes</h2>
        </div>
        <div className="mt-2 overflow-y-auto md:p-5 md:pt-2">
          <LikesListSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col overflow-hidden bg-neutral-950 text-neutral-25">
        <div className="md:px-6 md:pt-6 md:pb-0">
          <h2 className="text-md md:text-xl font-bold">Likes</h2>
        </div>
        <div className="mt-2 grid gap-3 rounded-[14px] border border-neutral-900 p-4 md:m-5 md:mt-2">
          <p className="text-sm text-[var(--red)]">{errorMessage}</p>
          <Button
            type="button"
            onClick={() => refetch()}
            className="h-9 w-fit rounded-full bg-primary-300 px-4 text-sm font-bold hover:bg-primary-200"
          >
            Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden bg-neutral-950 text-neutral-25">
      <div className="md:px-6 md:pt-6 md:pb-0">
        <h2 className="text-md md:text-xl font-bold">Likes</h2>
      </div>

      <div
        ref={listContainerRef}
        className="mt-2 grid max-h-[56vh] gap-2 overflow-y-auto md:max-h-[52vh] md:p-5 md:pt-2"
      >
        {users.length === 0 ? (
          <div className="rounded-[14px] border border-neutral-900 p-4">
            <p className="text-sm text-neutral-400">Belum ada likes.</p>
          </div>
        ) : (
          users.map((user) => {
            const avatarFallback = user.name.trim().charAt(0).toUpperCase() || "U";
            const isCurrentUserPending = isFollowPending && activeFollowUserId === user.id;

            return (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-[14px] py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-12 border border-[rgba(126,145,183,0.24)]">
                      <AvatarImage
                        src={user.avatarUrl ?? "/dummy-profile-image.png"}
                        alt={user.name}
                      />
                      <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{user.name}</p>
                      <p className="truncate text-sm text-neutral-400">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </div>

                {user.isMe ? null : (
                  <FollowUserButton
                    following={user.isFollowedByMe}
                    disabled={isCurrentUserPending}
                    onToggle={() => {
                      if (isCurrentUserPending) {
                        return;
                      }

                      toggleFollowMutation.mutate({
                        postId,
                        userId: user.id,
                        username: user.username,
                        following: user.isFollowedByMe,
                      });
                    }}
                  />
                )}
              </div>
            );
          })
        )}

        {isFetchingNextPage ? <LikesListSkeleton /> : null}

        <div ref={loadMoreRef} className="h-1 w-full" aria-hidden />
      </div>
    </div>
  );
}
