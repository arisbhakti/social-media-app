"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoBookmarkOutline, IoClose } from "react-icons/io5";

import { PostCard } from "@/components/site/post-card";
import { FollowUserButton } from "@/components/site/post-card/follow-user-button";
import { showErrorToast, showSuccessToast } from "@/components/ui/app-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ApiError,
  useMyFollowersInfiniteQuery,
  useMyFollowingInfiniteQuery,
  useMyFollowingUserIdsQuery,
  useMyPostsInfiniteQuery,
  useMyProfileQuery,
  useMySavedPostsInfiniteQuery,
  useToggleFollowMutation,
} from "@/lib/tanstack/post-queries";
import { cn } from "@/lib/utils";

type ProfileTab = "gallery" | "saved";
type ConnectionsVariant = "followers" | "following";
type OpenConnectionsModal = ConnectionsVariant | null;

type ProfileGridPost = {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author?: {
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  likedByMe?: boolean;
  savedByMe?: boolean;
  likeCount?: number;
  commentCount?: number;
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
            key={`profile-stat-skeleton-${index}`}
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
          key={`profile-grid-skeleton-${index}`}
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
          key={`connections-list-skeleton-${index}`}
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
};

function ConnectionsList({ variant }: ConnectionsListProps) {
  const isFollowingVariant = variant === "following";
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const followingQuery = useMyFollowingInfiniteQuery(10, isFollowingVariant);
  const followersQuery = useMyFollowersInfiniteQuery(10, !isFollowingVariant);
  const activeQuery = isFollowingVariant ? followingQuery : followersQuery;
  const { data: followingUserIds } = useMyFollowingUserIdsQuery(50, true);
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

  const followingUserIdsSet = useMemo(
    () => new Set(followingUserIds ?? []),
    [followingUserIds]
  );

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
        dedupedUsers.set(user.id, {
          ...user,
          isFollowedByMe: followingUserIds
            ? followingUserIdsSet.has(user.id)
            : user.isFollowedByMe,
        });
      }
    }

    const allUsers = Array.from(dedupedUsers.values());
    if (isFollowingVariant && followingUserIds) {
      return allUsers.filter((user) => followingUserIdsSet.has(user.id));
    }

    return allUsers;
  }, [connectionsData?.pages, followingUserIds, followingUserIdsSet, isFollowingVariant]);

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
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

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
                ? "Kamu belum follow siapa pun."
                : "Belum ada followers."}
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile: boolean;
};

function ConnectionsModal({
  variant,
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

            <ConnectionsList variant={variant} />
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

          <ConnectionsList variant={variant} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MyProfilePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<ProfileTab>("gallery");
  const [openConnectionsModal, setOpenConnectionsModal] =
    useState<OpenConnectionsModal>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const profileQuery = useMyProfileQuery(true);
  const galleryPostsQuery = useMyPostsInfiniteQuery(9, activeTab === "gallery");
  const savedPostsQuery = useMySavedPostsInfiniteQuery(9, activeTab === "saved");
  const activePostsQuery =
    activeTab === "gallery" ? galleryPostsQuery : savedPostsQuery;
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
        page.data.items.map((item) => ({
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

  const savedPosts = useMemo<ProfileGridPost[]>(
    () =>
      savedPostsQuery.data?.pages.flatMap((page) =>
        page.data.posts.map((item) => ({
          id: item.id,
          imageUrl: item.imageUrl,
          caption: item.caption,
          createdAt: item.createdAt,
        }))
      ) ?? [],
    [savedPostsQuery.data]
  );

  const activePosts = activeTab === "gallery" ? galleryPosts : savedPosts;

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
  }, [
    fetchNextPostsPage,
    hasNextPostsPage,
    isFetchingNextPostsPage,
  ]);

  const profile = profileQuery.data?.data.profile;
  const stats = profileQuery.data?.data.stats;

  const handleShareProfile = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const shareUrl = window.location.href;
    const shareText = profile
      ? `Lihat profile ${profile.name} (@${profile.username}) di Sociality`
      : "Lihat profile saya di Sociality";

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
    "Gagal memuat profil"
  );
  const postsErrorMessage = getErrorMessage(
    activePostsError,
    activeTab === "gallery"
      ? "Gagal memuat postingan kamu"
      : "Gagal memuat postingan tersimpan"
  );

  const renderActionButton = (mobile = false) => {
    const widthClass = mobile ? "flex-1" : "min-w-[130px] px-8";

    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => router.push("/editprofile")}
        className={cn(
          "h-10 md:h-12 rounded-full border border-neutral-900 bg-transparent font-bold text-sm md:text-md hover:bg-transparent",
          widthClass
        )}
      >
        Edit Profile
      </Button>
    );
  };

  return (
    <main className="flex w-full flex-1 justify-center px-4 pt-0 pb-28 md:px-0 md:pt-0 md:pb-32">
      <section className="w-full max-w-203">
        {profileQuery.isLoading ? (
          <ProfileHeaderSkeleton />
        ) : profileQuery.error || !profile || !stats ? (
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-6">
            <p className="text-md font-semibold text-[var(--red)]">
              {profileErrorMessage}
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              Silakan coba lagi untuk memuat profil.
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
                {renderActionButton()}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Share profile"
                  onClick={handleShareProfile}
                  className="size-10 md:size-12 rounded-full border border-neutral-900 bg-transparent"
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
              {renderActionButton(true)}
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
                { key: "posts", label: "Post", value: stats.posts },
                { key: "followers", label: "Followers", value: stats.followers },
                { key: "following", label: "Following", value: stats.following },
                { key: "likes", label: "Likes", value: stats.likes },
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
                "flex items-center justify-center gap-2 border-b-2 py-3 text-sm md:text-md transition-colors",
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
              onClick={() => setActiveTab("saved")}
              className={cn(
                "flex items-center justify-center gap-2 border-b-2 py-3 text-sm md:text-md transition-colors",
                activeTab === "saved"
                  ? "border-white text-white font-bold"
                  : "border-transparent text-neutral-400"
              )}
            >
              <IoBookmarkOutline className="size-5" />
              Saved
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
            <h2 className="text-md md:text-lg font-bold">
              {activeTab === "gallery"
                ? "Your story starts here"
                : "Belum ada post tersimpan"}
            </h2>
            <p className="text-sm md:text-md text-neutral-400">
              {activeTab === "gallery"
                ? "Share your first post and let the world see your moments, passions, and memories. Make this space truly yours."
                : "Simpan postingan yang kamu suka, nanti akan muncul di tab ini."}
            </p>
            {activeTab === "gallery" ? (
              <Button
                type="button"
                onClick={() => router.push("/addpost")}
                className="mt-4 md:mt-6 h-10 md:h-12 w-full max-w-[420px] rounded-full bg-[linear-gradient(180deg,#7f51f9_0%,#6936f2_100%)] text-[16px] leading-[20px] font-semibold text-[var(--base-pure-white)] hover:bg-[linear-gradient(180deg,#7f51f9_0%,#6936f2_100%)] md:max-w-[259px]"
              >
                Upload My First Post
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-0.5 md:mt-6 md:gap-1">
            {activePosts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                imageSrc={post.imageUrl}
                imageAlt={post.caption || "My post image"}
                liked={Boolean(post.likedByMe)}
                saved={activeTab === "saved" ? true : Boolean(post.savedByMe)}
                authorName={post.author?.name || profile?.name || "Unknown"}
                authorUsername={post.author?.username || profile?.username || ""}
                authorAvatarUrl={post.author?.avatarUrl ?? profile?.avatarUrl ?? null}
                caption={post.caption}
                createdAtLabel={formatRelativeTime(post.createdAt)}
                likeCount={post.likeCount ?? 0}
                commentCount={post.commentCount ?? 0}
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
        isMobile={isMobile}
        open={openConnectionsModal === "following"}
        onOpenChange={(open) => setOpenConnectionsModal(open ? "following" : null)}
      />
      <ConnectionsModal
        variant="followers"
        isMobile={isMobile}
        open={openConnectionsModal === "followers"}
        onOpenChange={(open) => setOpenConnectionsModal(open ? "followers" : null)}
      />
    </main>
  );
}
