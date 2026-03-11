"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IoCheckmarkCircleOutline,
  IoClose,
  IoHeartOutline,
} from "react-icons/io5";

import { PostCard } from "@/components/site/post-card";
import { FollowUserButton } from "@/components/site/post-card/follow-user-button";
import { useIsMobile } from "@/hooks/use-mobile";
import { showErrorToast, showSuccessToast } from "@/components/ui/app-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError,
  useToggleFollowMutation,
  useUserFollowersInfiniteQuery,
  useUserLikedPostsInfiniteQuery,
  useUserFollowingInfiniteQuery,
  useUserPostsInfiniteQuery,
  useUserProfileQuery,
} from "@/lib/tanstack/post-queries";
import { cn } from "@/lib/utils";

type ProfileTab = "gallery" | "liked";
type ConnectionsVariant = "followers" | "following";
type OpenConnectionsModal = ConnectionsVariant | null;

type ProfileGridPost = {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: {
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  likedByMe: boolean;
  savedByMe?: boolean;
  likeCount: number;
  commentCount: number;
};

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function formatRelativeTime(isoDate: string) {
  const targetDate = new Date(isoDate);
  if (Number.isNaN(targetDate.getTime())) {
    return "Just now";
  }

  const secondsDiff = Math.round((targetDate.getTime() - Date.now()) / 1000);
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

function ProfileHeaderSkeleton() {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-5">
          <Skeleton className="size-16 rounded-full" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-26 md:h-5 md:w-30" />
            <Skeleton className="h-4 w-20 md:h-5 md:w-24" />
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Skeleton className="h-12 w-36 rounded-full" />
          <Skeleton className="size-12 rounded-full" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 md:hidden">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="size-[42px] rounded-full" />
      </div>

      <Skeleton className="mt-4 h-4 w-[78%]" />

      <div className="mt-3 grid grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`other-profile-stat-skeleton-${index}`}
            className={cn(
              "grid place-items-center gap-1 px-2",
              index < 3 && "border-r border-[rgba(126,145,183,0.2)]"
            )}
          >
            <Skeleton className="h-6 w-8 md:h-7 md:w-10" />
            <Skeleton className="h-3.5 w-14 md:h-4 md:w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-0.5 md:mt-6 md:gap-1">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={`other-profile-grid-skeleton-${index}`}
          className="aspect-square rounded-[2.67px] md:rounded-[6px]"
        />
      ))}
    </div>
  );
}

function ConnectionsListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`other-connections-list-skeleton-${index}`}
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

type ConnectionsListProps = {
  variant: ConnectionsVariant;
  username: string;
};

function ConnectionsList({ variant, username }: ConnectionsListProps) {
  const isFollowingVariant = variant === "following";
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const followingQuery = useUserFollowingInfiniteQuery(
    username,
    10,
    isFollowingVariant
  );
  const followersQuery = useUserFollowersInfiniteQuery(
    username,
    10,
    !isFollowingVariant
  );
  const activeQuery = isFollowingVariant ? followingQuery : followersQuery;
  const toggleFollowMutation = useToggleFollowMutation();
  const title = isFollowingVariant ? "Following" : "Followers";
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data: connectionsData,
    error: connectionsError,
    isLoading: isConnectionsLoading,
    refetch: refetchConnections,
  } = activeQuery;

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

    for (const page of connectionsData?.pages ?? []) {
      for (const user of page.data.users) {
        dedupedUsers.set(user.id, user);
      }
    }

    return Array.from(dedupedUsers.values());
  }, [connectionsData]);

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
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const errorMessage = getErrorMessage(
    connectionsError,
    isFollowingVariant
      ? "Gagal memuat daftar following"
      : "Gagal memuat daftar followers"
  );

  if (isConnectionsLoading) {
    return (
      <div className="flex flex-col overflow-hidden bg-neutral-950 text-neutral-25">
        <div className="md:px-6 md:pt-6 md:pb-0">
          <h2 className="text-md md:text-xl font-bold">{title}</h2>
        </div>
        <div className="mt-2 overflow-y-auto md:p-5 md:pt-2">
          <ConnectionsListSkeleton />
        </div>
      </div>
    );
  }

  if (connectionsError) {
    return (
      <div className="flex flex-col overflow-hidden bg-neutral-950 text-neutral-25">
        <div className="md:px-6 md:pt-6 md:pb-0">
          <h2 className="text-md md:text-xl font-bold">{title}</h2>
        </div>
        <div className="mt-2 grid gap-3 rounded-[14px] border border-neutral-900 p-4 md:m-5 md:mt-2">
          <p className="text-sm text-[var(--red)]">{errorMessage}</p>
          <Button
            type="button"
            onClick={() => refetchConnections()}
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
        <h2 className="text-md md:text-xl font-bold">{title}</h2>
      </div>

      <div
        ref={listContainerRef}
        className="mt-2 grid max-h-[56vh] gap-2 overflow-y-auto md:max-h-[52vh] md:p-5 md:pt-2"
      >
        {users.length === 0 ? (
          <div className="rounded-[14px] border border-neutral-900 p-4">
            <p className="text-sm text-neutral-400">
              {isFollowingVariant
                ? "User ini belum follow siapa pun."
                : "User ini belum punya followers."}
            </p>
          </div>
        ) : (
          users.map((user) => {
            const avatarFallback = user.name.trim().charAt(0).toUpperCase() || "U";
            const isCurrentUserPending =
              isFollowPending && activeFollowUserId === user.id;

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

                <FollowUserButton
                  following={user.isFollowedByMe}
                  disabled={isCurrentUserPending}
                  onToggle={() => {
                    if (isCurrentUserPending) {
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
          })
        )}

        {isFetchingNextPage ? <ConnectionsListSkeleton rows={3} /> : null}

        <div ref={loadMoreRef} className="h-1 w-full" aria-hidden />
      </div>
    </div>
  );
}

type ConnectionsModalProps = {
  variant: ConnectionsVariant;
  username: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile: boolean;
};

function ConnectionsModal({
  variant,
  username,
  open,
  onOpenChange,
  isMobile,
}: ConnectionsModalProps) {
  const title = variant === "following" ? "Following" : "Followers";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="[&>div:first-child]:hidden max-h-[72vh] border-t border-t-[rgba(126,145,183,0.2)] bg-neutral-950 p-0!">
          <DrawerTitle className="sr-only">{title}</DrawerTitle>
          <div className="relative px-4 pt-4 pb-4">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Close ${title.toLowerCase()} list`}
              onClick={() => onOpenChange(false)}
              className="absolute -top-8 right-4 z-20 size-6 rounded-full p-0 text-[var(--base-pure-white)] hover:bg-transparent"
            >
              <IoClose className="size-6" />
            </Button>

            <ConnectionsList variant={variant} username={username} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[548px]! border-0 bg-neutral-950 p-0 text-neutral-25"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            aria-label={`Close ${title.toLowerCase()} list`}
            onClick={() => onOpenChange(false)}
            className="absolute -top-10 right-0 z-20 size-6 rounded-full p-0 text-white hover:bg-transparent"
          >
            <IoClose className="size-6" />
          </Button>

          <ConnectionsList variant={variant} username={username} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ProfilePageProps = {
  username: string;
};

export function ProfilePage({ username }: ProfilePageProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<ProfileTab>("gallery");
  const [openConnectionsModal, setOpenConnectionsModal] =
    useState<OpenConnectionsModal>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const normalizedUsername = username.trim();
  const profileQuery = useUserProfileQuery(normalizedUsername, true);
  const galleryPostsQuery = useUserPostsInfiniteQuery(
    normalizedUsername,
    9,
    activeTab === "gallery"
  );
  const likedPostsQuery = useUserLikedPostsInfiniteQuery(
    normalizedUsername,
    9,
    activeTab === "liked"
  );
  const toggleFollowMutation = useToggleFollowMutation();
  const activePostsQuery =
    activeTab === "gallery" ? galleryPostsQuery : likedPostsQuery;
  const {
    fetchNextPage: fetchNextPostsPage,
    hasNextPage: hasNextPostsPage,
    isFetchingNextPage: isFetchingNextPostsPage,
    error: activePostsError,
    isLoading: isLoadingActivePosts,
    refetch: refetchActivePosts,
  } = activePostsQuery;

  const galleryPosts = useMemo<ProfileGridPost[]>(
    () =>
      galleryPostsQuery.data?.pages.flatMap((page) =>
        page.data.posts.map((item) => ({
          id: item.id,
          imageUrl: item.imageUrl,
          caption: item.caption,
          createdAt: item.createdAt,
          author: item.author,
          likedByMe: item.likedByMe,
          savedByMe: item.savedByMe,
          likeCount: item.likeCount,
          commentCount: item.commentCount,
        }))
      ) ?? [],
    [galleryPostsQuery.data]
  );

  const likedPosts = useMemo<ProfileGridPost[]>(
    () =>
      likedPostsQuery.data?.pages.flatMap((page) =>
        page.data.posts.map((item) => ({
          id: item.id,
          imageUrl: item.imageUrl,
          caption: item.caption,
          createdAt: item.createdAt,
          author: item.author,
          likedByMe: item.likedByMe,
          savedByMe: item.savedByMe,
          likeCount: item.likeCount,
          commentCount: item.commentCount,
        }))
      ) ?? [],
    [likedPostsQuery.data]
  );

  const activePosts = activeTab === "gallery" ? galleryPosts : likedPosts;
  const profile = profileQuery.data?.data;

  useEffect(() => {
    if (!profile?.isMe) {
      return;
    }

    router.replace("/myprofile");
  }, [profile?.isMe, router]);

  useEffect(() => {
    if (!hasNextPostsPage || isFetchingNextPostsPage) {
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

        fetchNextPostsPage();
      },
      {
        rootMargin: "240px 0px",
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPostsPage, hasNextPostsPage, isFetchingNextPostsPage]);

  const handleShareProfile = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const shareUrl = window.location.href;
    const shareText = profile
      ? `Lihat profile ${profile.name} (@${profile.username}) di Sociality`
      : "Lihat profile di Sociality";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Sociality Profile",
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        showSuccessToast("Link profile berhasil disalin");
        return;
      }

      showErrorToast("Browser tidak mendukung fitur share");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      showErrorToast("Gagal membagikan profile");
    }
  }, [profile]);

  const profileErrorMessage = getErrorMessage(
    profileQuery.error,
    "Gagal memuat profil user"
  );
  const postsErrorMessage = getErrorMessage(
    activePostsError,
    activeTab === "gallery"
      ? "Gagal memuat postingan user"
      : "Gagal memuat liked posts user"
  );
  const isFollowPending =
    toggleFollowMutation.isPending &&
    toggleFollowMutation.variables?.userId === profile?.id;

  if (profile?.isMe) {
    return null;
  }

  return (
    <main className="flex w-full flex-1 justify-center px-4 pt-0 pb-28 md:px-0 md:pt-0 md:pb-32">
      <section className="w-full max-w-203">
        {profileQuery.isLoading ? (
          <ProfileHeaderSkeleton />
        ) : profileQuery.error || !profile ? (
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-6">
            <p className="text-md font-semibold text-[var(--red)]">
              {profileErrorMessage}
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              Silakan coba lagi untuk memuat profil user.
            </p>
            <Button
              type="button"
              onClick={() => profileQuery.refetch()}
              className="mt-4 h-10 rounded-full bg-primary-300 px-5 text-sm font-bold text-white hover:bg-primary-200"
            >
              Coba lagi
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 md:gap-5">
                  <Avatar className="size-16">
                    <AvatarImage
                      src={profile.avatarUrl ?? "/dummy-profile-image.png"}
                      alt={profile.name}
                    />
                    <AvatarFallback>
                      {profile.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-sm md:text-md font-bold">{profile.name}</h1>
                    <p className="text-sm md:text-md">@{profile.username}</p>
                  </div>
                </div>
              </div>

              <div className="hidden shrink-0 items-center gap-3 md:flex">
                <Button
                  type="button"
                  variant={profile.isFollowing ? "ghost" : "default"}
                  disabled={isFollowPending}
                  onClick={() => {
                    if (isFollowPending) {
                      return;
                    }

                    toggleFollowMutation.mutate({
                      userId: profile.id,
                      username: profile.username,
                      following: profile.isFollowing,
                    });
                  }}
                  className={cn(
                    "h-10 min-w-[130px] rounded-full px-8 text-sm font-bold md:h-12 md:text-md",
                    profile.isFollowing
                      ? "border border-neutral-900 bg-transparent hover:bg-transparent"
                      : "bg-primary-300 text-white hover:bg-primary-200"
                  )}
                >
                  {profile.isFollowing ? (
                    <>
                      <IoCheckmarkCircleOutline className="size-5 md:size-6" />
                      Following
                    </>
                  ) : (
                    "Follow"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Share profile"
                  onClick={handleShareProfile}
                  className="size-10 rounded-full border border-neutral-900 bg-transparent md:size-12"
                >
                  <Image
                    src="/icon-share.svg"
                    alt="Share"
                    width={24}
                    height={24}
                    className="size-5 md:size-6"
                  />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 md:hidden">
              <Button
                type="button"
                variant={profile.isFollowing ? "ghost" : "default"}
                disabled={isFollowPending}
                onClick={() => {
                  if (isFollowPending) {
                    return;
                  }

                  toggleFollowMutation.mutate({
                    userId: profile.id,
                    username: profile.username,
                    following: profile.isFollowing,
                  });
                }}
                className={cn(
                  "h-10 flex-1 rounded-full text-sm font-bold",
                  profile.isFollowing
                    ? "border border-neutral-900 bg-transparent hover:bg-transparent"
                    : "bg-primary-300 text-white hover:bg-primary-200"
                )}
              >
                {profile.isFollowing ? (
                  <>
                    <IoCheckmarkCircleOutline className="size-5" />
                    Following
                  </>
                ) : (
                  "Follow"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Share profile"
                onClick={handleShareProfile}
                className="size-[42px] rounded-full border border-[rgba(126,145,183,0.2)] bg-transparent text-[var(--base-pure-white)] hover:bg-transparent"
              >
                <Image
                  src="/icon-share.svg"
                  alt="Share"
                  width={18}
                  height={18}
                  className="size-[18px]"
                />
              </Button>
            </div>

            <p className="mt-4 text-sm md:text-md">
              {profile.bio?.trim() || "Belum ada bio."}
            </p>

            <div className="mt-3 grid grid-cols-4">
              {[
                { key: "post", label: "Post", value: profile.counts.post },
                {
                  key: "followers",
                  label: "Followers",
                  value: profile.counts.followers,
                },
                {
                  key: "following",
                  label: "Following",
                  value: profile.counts.following,
                },
                { key: "likes", label: "Likes", value: profile.counts.likes },
              ].map((item, index) => {
                const isInteractive =
                  item.key === "followers" || item.key === "following";

                return (
                  <div
                    key={item.key}
                    className={cn(
                      "flex flex-col items-center px-2",
                      index < 3 && "border-r border-[rgba(126,145,183,0.2)]"
                    )}
                  >
                    {isInteractive ? (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenConnectionsModal(
                            item.key === "followers" ? "followers" : "following"
                          )
                        }
                        className="grid place-items-center transition-opacity hover:opacity-90"
                      >
                        <p className="text-lg md:text-xl font-bold">{item.value}</p>
                        <p className="text-xs md:text-md text-neutral-400">
                          {item.label}
                        </p>
                      </button>
                    ) : (
                      <>
                        <p className="text-lg md:text-xl font-bold">{item.value}</p>
                        <p className="text-xs md:text-md text-neutral-400">
                          {item.label}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-4 border-b border-[rgba(126,145,183,0.2)]">
          <div className="grid grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              className={cn(
                "flex items-center justify-center gap-2 border-b-2 py-3 text-sm transition-colors md:text-md",
                activeTab === "gallery"
                  ? "border-white text-white font-bold"
                  : "border-transparent text-neutral-400"
              )}
            >
              <LayoutGrid className="size-5" />
              Gallery
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("liked")}
              className={cn(
                "flex items-center justify-center gap-2 border-b-2 py-3 text-sm transition-colors md:text-md",
                activeTab === "liked"
                  ? "border-white text-white font-bold"
                  : "border-transparent text-neutral-400"
              )}
            >
              <IoHeartOutline className="size-5" />
              Liked
            </button>
          </div>
        </div>

        {isLoadingActivePosts ? (
          <ProfileGridSkeleton />
        ) : activePostsError ? (
          <div className="mt-6 rounded-2xl border border-neutral-900 bg-neutral-950 p-6">
            <p className="text-md font-semibold text-[var(--red)]">
              {postsErrorMessage}
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              Silakan coba lagi untuk memuat postingan.
            </p>
            <Button
              type="button"
              onClick={() => refetchActivePosts()}
              className="mt-4 h-10 rounded-full bg-primary-300 px-5 text-sm font-bold text-white hover:bg-primary-200"
            >
              Coba lagi
            </Button>
          </div>
        ) : activePosts.length === 0 ? (
          <div className="mx-auto flex min-h-[360px] max-w-113.25 flex-col items-center justify-center px-4 text-center md:min-h-[500px] md:pt-16">
            <h2 className="text-md md:text-lg font-bold">No posts yet</h2>
            <p className="text-sm md:text-md text-neutral-400">
              This user has no posts in this tab yet.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-0.5 md:mt-6 md:gap-1">
            {activePosts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                imageSrc={post.imageUrl}
                imageAlt={post.caption || "User post image"}
                liked={post.likedByMe}
                saved={Boolean(post.savedByMe)}
                authorName={post.author.name || post.author.username}
                authorUsername={post.author.username}
                authorAvatarUrl={post.author.avatarUrl}
                caption={post.caption}
                createdAtLabel={formatRelativeTime(post.createdAt)}
                likeCount={post.likeCount}
                commentCount={post.commentCount}
                thumbnailOnly
              />
            ))}
          </div>
        )}

        {activePosts.length > 0 && isFetchingNextPostsPage ? (
          <ProfileGridSkeleton count={3} />
        ) : null}

        <div ref={loadMoreRef} className="h-1 w-full" aria-hidden />
      </section>

      <ConnectionsModal
        variant="following"
        username={normalizedUsername}
        isMobile={isMobile}
        open={openConnectionsModal === "following"}
        onOpenChange={(open) => setOpenConnectionsModal(open ? "following" : null)}
      />
      <ConnectionsModal
        variant="followers"
        username={normalizedUsername}
        isMobile={isMobile}
        open={openConnectionsModal === "followers"}
        onOpenChange={(open) => setOpenConnectionsModal(open ? "followers" : null)}
      />
    </main>
  );
}
