"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { FollowUserButton } from "@/components/site/post-card/follow-user-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError,
  useToggleFollowMutation,
  useUserSearchInfiniteQuery,
} from "@/lib/tanstack/post-queries";

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function SearchResultSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="mt-4 grid gap-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`search-user-skeleton-${index}`}
          className="flex items-center justify-between gap-3 rounded-[14px] border border-neutral-900 bg-neutral-950 px-3 py-2"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="size-12 rounded-full" />
            <div className="grid gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-26 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const query = searchParams.get("q")?.trim() ?? "";
  const searchQuery = useUserSearchInfiniteQuery(query, 20, query.length > 0);
  const toggleFollowMutation = useToggleFollowMutation();
  const {
    data,
    error,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = searchQuery;

  const users = useMemo(() => {
    const dedupedUsers = new Map<
      number,
      {
        id: number;
        username: string;
        name: string;
        avatarUrl: string | null;
        isFollowedByMe: boolean;
      }
    >();

    for (const page of data?.pages ?? []) {
      for (const user of page.data.users) {
        dedupedUsers.set(user.id, user);
      }
    }

    return Array.from(dedupedUsers.values());
  }, [data]);

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
        rootMargin: "220px 0px",
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const errorMessage = getErrorMessage(error, "Gagal mencari user");
  const activeFollowUserId = toggleFollowMutation.variables?.userId;

  return (
    <main className="flex w-full flex-1 justify-center px-4 pt-0 pb-28 md:px-0 md:pb-32">
      <section className="w-full max-w-203">
        <div className="border-b border-[rgba(126,145,183,0.2)] pb-3">
          <h1 className="text-md md:text-lg font-bold">Search Results</h1>
          <p className="text-sm text-neutral-400">
            {query ? `Menampilkan hasil untuk \"${query}\"` : "Ketik kata kunci untuk mencari user."}
          </p>
        </div>

        {!query ? (
          <div className="mx-auto flex min-h-[360px] max-w-113.25 flex-col items-center justify-center px-4 text-center md:min-h-[500px]">
            <h2 className="text-md md:text-lg font-bold">Mulai mencari user</h2>
            <p className="text-sm md:text-md text-neutral-400">
              Ketik nama atau username user di search bar.
            </p>
          </div>
        ) : isLoading ? (
          <SearchResultSkeleton />
        ) : error ? (
          <div className="mt-4 rounded-2xl border border-neutral-900 bg-neutral-950 p-6">
            <p className="text-md font-semibold text-[var(--red)]">{errorMessage}</p>
            <p className="mt-2 text-sm text-neutral-400">
              Silakan coba lagi untuk memuat hasil pencarian.
            </p>
            <Button
              type="button"
              onClick={() => refetch()}
              className="mt-4 h-10 rounded-full bg-primary-300 px-5 text-sm font-bold text-white hover:bg-primary-200"
            >
              Coba lagi
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="mx-auto flex min-h-[360px] max-w-113.25 flex-col items-center justify-center px-4 text-center md:min-h-[500px]">
            <h2 className="text-md md:text-lg font-bold">User tidak ditemukan</h2>
            <p className="text-sm md:text-md text-neutral-400">
              Coba kata kunci lain.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-2">
            {users.map((user) => {
              const isFollowPending =
                toggleFollowMutation.isPending && activeFollowUserId === user.id;
              const avatarFallback = user.name.trim().charAt(0).toUpperCase() || "U";

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-[14px] border border-neutral-900 bg-neutral-950 px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/profile/${encodeURIComponent(user.username.trim())}`)
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="size-12 border border-[rgba(126,145,183,0.24)]">
                        <AvatarImage
                          src={user.avatarUrl ?? "/dummy-profile-image.png"}
                          alt={user.name}
                        />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{user.name}</p>
                        <p className="truncate text-sm text-neutral-400">@{user.username}</p>
                      </div>
                    </div>
                  </button>

                  <FollowUserButton
                    following={user.isFollowedByMe}
                    disabled={isFollowPending}
                    onToggle={() => {
                      if (isFollowPending) {
                        return;
                      }

                      toggleFollowMutation.mutate({
                        userId: user.id,
                        username: user.username,
                        following: user.isFollowedByMe,
                      });
                    }}
                  />
                </div>
              );
            })}

            {isFetchingNextPage ? <SearchResultSkeleton rows={3} /> : null}
          </div>
        )}

        <div ref={loadMoreRef} className="h-1 w-full" aria-hidden />
      </section>
    </main>
  );
}
