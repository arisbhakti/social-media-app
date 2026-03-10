"use client";

import { useEffect, useMemo, useRef } from "react";

import { PostCard } from "@/components/site/post-card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  useMyLikedPostIdsQuery,
  usePostsInfiniteQuery,
} from "@/lib/tanstack/post-queries";

function formatRelativeTime(isoDate: string) {
  const targetDate = new Date(isoDate);
  if (Number.isNaN(targetDate.getTime())) {
    return "Just now";
  }

  const secondsDiff = Math.round(
    (targetDate.getTime() - Date.now()) / 1000,
  );
  const absoluteSeconds = Math.abs(secondsDiff);
  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  if (absoluteSeconds < 60) {
    return formatter.format(secondsDiff, "second");
  }

  const minutesDiff = Math.round(secondsDiff / 60);
  if (Math.abs(minutesDiff) < 60) {
    return formatter.format(minutesDiff, "minute");
  }

  const hoursDiff = Math.round(minutesDiff / 60);
  if (Math.abs(hoursDiff) < 24) {
    return formatter.format(hoursDiff, "hour");
  }

  const daysDiff = Math.round(hoursDiff / 24);
  if (Math.abs(daysDiff) < 30) {
    return formatter.format(daysDiff, "day");
  }

  const monthsDiff = Math.round(daysDiff / 30);
  if (Math.abs(monthsDiff) < 12) {
    return formatter.format(monthsDiff, "month");
  }

  const yearsDiff = Math.round(monthsDiff / 12);
  return formatter.format(yearsDiff, "year");
}

function PostCardSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full md:size-16" />
        <div className="grid gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="size-6" />
      </div>
      <div className="grid gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[85%]" />
      </div>
    </div>
  );
}

export function HomeFeed() {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = usePostsInfiniteQuery(20);
  const likedPostIdsQuery = useMyLikedPostIdsQuery(50);
  const likedPostIdsSet = useMemo(
    () => new Set(likedPostIdsQuery.data ?? []),
    [likedPostIdsQuery.data],
  );
  const hasLikedPostSnapshot = Boolean(likedPostIdsQuery.data);

  const posts = useMemo(
    () =>
      data?.pages.flatMap((page) =>
        page.data.posts.map((post) => ({
          ...post,
          likedByMe: hasLikedPostSnapshot
            ? likedPostIdsSet.has(post.id)
            : post.likedByMe,
        })),
      ) ?? [],
    [data, hasLikedPostSnapshot, likedPostIdsSet],
  );

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

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
        rootMargin: "240px 0px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <section className="flex w-full max-w-[600px] flex-col gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`post-skeleton-${index}`} className="grid gap-5">
            <PostCardSkeleton />
            {index < 2 ? <Separator className="bg-neutral-900" /> : null}
          </div>
        ))}
      </section>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Gagal memuat postingan";

    return (
      <section className="flex w-full max-w-[600px] flex-col gap-6">
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-6">
          <p className="text-md font-semibold text-[var(--red)]">
            {errorMessage}
          </p>
          <p className="mt-2 text-sm text-neutral-400">
            Silakan coba lagi untuk memuat postingan.
          </p>
          <Button
            type="button"
            onClick={() => refetch()}
            className="mt-4 h-10 rounded-full bg-primary-300 px-5 text-sm font-bold text-white hover:bg-primary-200"
          >
            Coba lagi
          </Button>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="flex w-full max-w-[600px] flex-col gap-6">
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-6">
          <p className="text-md font-semibold text-neutral-200">
            Belum ada postingan.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full max-w-[600px] flex-col gap-6">
      {posts.map((post) => (
        <div key={post.id} className="grid gap-5">
          <PostCard
            postId={post.id}
            imageSrc={post.imageUrl}
            imageAlt={post.caption || `Post by ${post.author.username}`}
            liked={post.likedByMe}
            hasInitialComments={false}
            authorName={post.author.name || post.author.username}
            authorAvatarUrl={post.author.avatarUrl}
            caption={post.caption}
            createdAtLabel={formatRelativeTime(post.createdAt)}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
          />
          <Separator className="bg-neutral-900" />
        </div>
      ))}

      {isFetchingNextPage ? (
        <div className="grid gap-5">
          <PostCardSkeleton />
        </div>
      ) : null}

      <div ref={loadMoreRef} className="h-1 w-full" aria-hidden />
    </section>
  );
}
