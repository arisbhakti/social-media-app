"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  IoArrowBackOutline,
  IoCloseOutline,
  IoMenuOutline,
  IoSearchOutline,
} from "react-icons/io5";

import { FollowUserButton } from "@/components/site/post-card/follow-user-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthSession } from "@/lib/auth-session";
import {
  ApiError,
  useToggleFollowMutation,
  useUserSearchInfiniteQuery,
} from "@/lib/tanstack/post-queries";
import { cn } from "@/lib/utils";

function getProfileTitle(pathname: string) {
  if (pathname === "/addpost") {
    return "Add Post";
  }

  if (pathname === "/editprofile") {
    return "Edit Profile";
  }

  if (pathname === "/myprofile") {
    return "John Doe";
  }

  if (!pathname.startsWith("/profile/")) {
    return "Profile";
  }

  const profileId = pathname.split("/")[2] ?? "";
  if (!profileId || profileId.toLowerCase() === "id") {
    return "John Doe";
  }

  return profileId
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
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

type GuestActionButtonsProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

function GuestActionButtons({
  mobile = false,
  onNavigate,
}: GuestActionButtonsProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        mobile ? "grid grid-cols-2 gap-3" : "gap-4"
      )}
    >
      <Button
        asChild
        variant="ghost"
        className={cn(
          "rounded-full border border-neutral-900 bg-transparent font-bold hover:scale-[1.01] hover:border-neutral-800 active:scale-[0.99]",
          mobile ? "h-10 w-full text-sm" : "h-11 min-w-32.5 px-8 text-md"
        )}
      >
        <Link href="/login" onClick={onNavigate}>
          Login
        </Link>
      </Button>
      <Button
        asChild
        className={cn(
          "rounded-full bg-primary-300 font-bold hover:scale-[1.01] hover:bg-primary-200 hover:text-base-pure-white active:scale-[0.99]",
          mobile ? "h-10 w-full text-sm" : "h-11 min-w-32.5 px-8 text-md"
        )}
      >
        <Link href="/register" onClick={onNavigate}>
          Register
        </Link>
      </Button>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isProfileRoute =
    pathname === "/myprofile" ||
    pathname === "/editprofile" ||
    pathname === "/addpost" ||
    pathname.startsWith("/profile/");
  const profileTitle = getProfileTitle(pathname);
  const queryFromUrl = searchParams.get("q")?.trim() ?? "";
  const isMobileSearchContextRoute = pathname === "/home" || pathname === "/search";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("John Doe");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isMobileGuestMenuOpen, setIsMobileGuestMenuOpen] = useState(false);

  const [desktopSearchInput, setDesktopSearchInput] = useState("");
  const [desktopSearchQuery, setDesktopSearchQuery] = useState("");
  const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false);
  const desktopSearchContainerRef = useRef<HTMLDivElement | null>(null);

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileSearchInput, setMobileSearchInput] = useState("");

  useEffect(() => {
    const syncAuthSession = () => {
      const session = getAuthSession();
      if (!session?.token) {
        setIsLoggedIn(false);
        setDisplayName("John Doe");
        setAvatarUrl(null);
        return;
      }

      setIsLoggedIn(true);
      setDisplayName(session.user?.name || session.user?.username || "John Doe");
      setAvatarUrl(session.user?.avatarUrl ?? null);
    };

    syncAuthSession();
    window.addEventListener("storage", syncAuthSession);

    return () => {
      window.removeEventListener("storage", syncAuthSession);
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDesktopSearchQuery(desktopSearchInput.trim());
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [desktopSearchInput]);

  useEffect(() => {
    if (!isDesktopSearchFocused) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (desktopSearchContainerRef.current?.contains(event.target)) {
        return;
      }

      setIsDesktopSearchFocused(false);
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isDesktopSearchFocused]);

  useEffect(() => {
    if (!isMobileSearchOpen) {
      return;
    }

    if (!isMobileSearchContextRoute) {
      return;
    }

    const normalizedQuery = mobileSearchInput.trim();
    if (!normalizedQuery) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (pathname === "/search" && queryFromUrl === normalizedQuery) {
        return;
      }

      router.replace(`/search?q=${encodeURIComponent(normalizedQuery)}`);
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    isMobileSearchContextRoute,
    isMobileSearchOpen,
    mobileSearchInput,
    pathname,
    queryFromUrl,
    router,
  ]);

  useEffect(() => {
    if (!isMobileSearchOpen) {
      return;
    }

    if (isMobileSearchContextRoute) {
      return;
    }

    setIsMobileSearchOpen(false);
    setMobileSearchInput("");
  }, [isMobileSearchContextRoute, isMobileSearchOpen]);

  const desktopSearchUsersQuery = useUserSearchInfiniteQuery(
    desktopSearchQuery,
    20,
    isLoggedIn && desktopSearchQuery.length > 0
  );
  const toggleFollowMutation = useToggleFollowMutation();

  const desktopSearchUsers = useMemo(() => {
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

    for (const page of desktopSearchUsersQuery.data?.pages ?? []) {
      for (const user of page.data.users) {
        dedupedUsers.set(user.id, user);
      }
    }

    return Array.from(dedupedUsers.values());
  }, [desktopSearchUsersQuery.data]);

  const showDesktopSearchDropdown =
    isLoggedIn && isDesktopSearchFocused && desktopSearchInput.trim().length > 0;
  const desktopSearchErrorMessage = getErrorMessage(
    desktopSearchUsersQuery.error,
    "Gagal mencari user"
  );
  const activeFollowUserId = toggleFollowMutation.variables?.userId;
  const isMobileSearchActive = isMobileSearchOpen || pathname === "/search";
  const mobileSearchValue =
    pathname === "/search" && !isMobileSearchOpen
      ? queryFromUrl
      : mobileSearchInput;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    if (pathname === "/editprofile") {
      router.push("/myprofile");
      return;
    }

    if (pathname === "/addpost") {
      router.push("/home");
      return;
    }

    router.push("/home");
  };

  const handleOpenUserProfile = (username: string) => {
    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      return;
    }

    setIsDesktopSearchFocused(false);
    router.push(`/profile/${encodeURIComponent(normalizedUsername)}`);
  };

  const handleToggleMobileSearch = () => {
    if (!isLoggedIn) {
      return;
    }

    setIsMobileSearchOpen((previousState) => !previousState);
    setIsMobileGuestMenuOpen(false);

    if (!isMobileSearchOpen && pathname === "/search") {
      setMobileSearchInput(queryFromUrl);
    }
  };

  const handleCloseMobileSearch = () => {
    if (pathname === "/search") {
      router.push("/home");
      return;
    }

    setIsMobileSearchOpen(false);
    setMobileSearchInput("");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex w-full flex-col bg-[var(--base-pure-black)] text-[var(--base-pure-white)]">
      <div className="hidden h-20 items-center justify-between px-30 py-0 md:flex">
        <Link
          href="/home"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <Image
            src="/icon-sociality.svg"
            alt="Sociality icon"
            width={30}
            height={30}
            priority
          />
          <span className="display-xs leading-none font-bold">Sociality</span>
        </Link>

        <div className="h-12 w-full max-w-122.75" ref={desktopSearchContainerRef}>
          <div className="relative w-full">
            <IoSearchOutline className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-[var(--neutral-500)]" />
            <Input
              type="search"
              placeholder={isLoggedIn ? "Search users" : "Login to search users"}
              aria-label="Search users"
              value={desktopSearchInput}
              disabled={!isLoggedIn}
              onFocus={() => setIsDesktopSearchFocused(true)}
              onChange={(event) => setDesktopSearchInput(event.target.value)}
              className="h-12 rounded-full border-neutral-900 bg-neutral-950 px-4 pl-11 text-[14px] leading-[20px] text-[var(--base-pure-white)] shadow-none placeholder:text-[var(--neutral-500)] focus-visible:border-[rgba(126,145,183,0.48)] focus-visible:ring-0"
            />

            {showDesktopSearchDropdown ? (
              <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full overflow-hidden rounded-[20px] border border-[rgba(126,145,183,0.2)] bg-neutral-950 p-3 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                <div className="max-h-[360px] space-y-1 overflow-y-auto pr-1">
                  {desktopSearchUsersQuery.isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`desktop-search-skeleton-${index}`}
                        className="flex items-center justify-between gap-3 rounded-[14px] px-2 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Skeleton className="size-11 rounded-full" />
                          <div className="grid gap-2">
                            <Skeleton className="h-4 w-26" />
                            <Skeleton className="h-3.5 w-22" />
                          </div>
                        </div>
                        <Skeleton className="h-9 w-22 rounded-full" />
                      </div>
                    ))
                  ) : desktopSearchUsersQuery.error ? (
                    <div className="rounded-[14px] border border-neutral-900 p-4">
                      <p className="text-sm text-[var(--red)]">{desktopSearchErrorMessage}</p>
                    </div>
                  ) : desktopSearchUsers.length === 0 ? (
                    <div className="rounded-[14px] border border-neutral-900 p-4">
                      <p className="text-sm text-neutral-400">User tidak ditemukan.</p>
                    </div>
                  ) : (
                    desktopSearchUsers.map((user) => {
                      const isFollowPending =
                        toggleFollowMutation.isPending && activeFollowUserId === user.id;
                      const avatarFallback =
                        user.name.trim().charAt(0).toUpperCase() || "U";

                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between gap-3 rounded-[14px] px-2 py-1.5 transition-colors hover:bg-neutral-900/65"
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenUserProfile(user.username)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <Avatar className="size-11 border border-[rgba(126,145,183,0.24)]">
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
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <Avatar className="size-12 border border-[rgba(126,145,183,0.32)]">
              <AvatarImage
                src={avatarUrl ?? "/dummy-profile-image.png"}
                alt={displayName}
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-md font-bold">{displayName}</span>
          </div>
        ) : (
          <GuestActionButtons />
        )}
      </div>

      <div className="flex h-16 items-center justify-between px-4 py-0 md:hidden">
        {isProfileRoute && isLoggedIn ? (
          <>
            <div className="flex min-w-0 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Go back"
                onClick={handleBack}
                className="size-8 rounded-full p-0 text-white hover:bg-[rgba(126,145,183,0.18)]"
              >
                <IoArrowBackOutline className="size-[20px]" />
              </Button>
              <span className="text-md font-bold">{profileTitle}</span>
            </div>

            <Avatar className="size-8 border border-[rgba(126,145,183,0.32)]">
              <AvatarImage
                src={avatarUrl ?? "/dummy-profile-image.png"}
                alt={displayName}
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </>
        ) : isMobileSearchActive ? (
          <div className="flex w-full items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close search"
              onClick={handleCloseMobileSearch}
              className="size-8 rounded-full p-0 text-white hover:bg-[rgba(126,145,183,0.18)]"
            >
              <IoArrowBackOutline className="size-[20px]" />
            </Button>

            <div className="relative flex-1">
              <IoSearchOutline className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-[var(--neutral-500)]" />
              <Input
                type="search"
                aria-label="Search users"
                placeholder="Search users"
                value={mobileSearchValue}
                onChange={(event) => {
                  if (!isMobileSearchOpen) {
                    setIsMobileSearchOpen(true);
                  }

                  setMobileSearchInput(event.target.value);
                }}
                className="h-10 rounded-full border-neutral-900 bg-neutral-950 px-3 pl-10 text-sm text-white shadow-none placeholder:text-neutral-500 focus-visible:border-[rgba(126,145,183,0.48)] focus-visible:ring-0"
              />
            </div>
          </div>
        ) : (
          <>
            <Link
              href="/home"
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <Image
                src="/icon-sociality.svg"
                alt="Sociality icon"
                width={30}
                height={30}
                priority
              />
              <span className="display-xs leading-none font-bold">Sociality</span>
            </Link>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Open search"
                disabled={!isLoggedIn}
                className="size-5 text-neutral-25"
                onClick={handleToggleMobileSearch}
              >
                <IoSearchOutline className="size-[20px]" />
              </Button>

              {isLoggedIn ? (
                <Avatar className="size-10 border border-[rgba(126,145,183,0.32)]">
                  <AvatarImage
                    src={avatarUrl ?? "/dummy-profile-image.png"}
                    alt={displayName}
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={isMobileGuestMenuOpen ? "Close menu" : "Open menu"}
                  className="size-6 text-neutral-25"
                  onClick={() =>
                    setIsMobileGuestMenuOpen((previousState) => !previousState)
                  }
                >
                  {isMobileGuestMenuOpen ? (
                    <IoCloseOutline className="size-[30px]" />
                  ) : (
                    <IoMenuOutline className="size-[30px]" />
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {!isLoggedIn ? (
        <div
          className={cn(
            "px-4 pb-4 transition-all duration-200 md:hidden",
            isMobileGuestMenuOpen
              ? "max-h-28 opacity-100"
              : "pointer-events-none max-h-0 overflow-hidden pb-0 opacity-0"
          )}
        >
          <GuestActionButtons
            mobile
            onNavigate={() => setIsMobileGuestMenuOpen(false)}
          />
        </div>
      ) : null}

      <Separator className="bg-[rgba(126,145,183,0.2)]" />
    </header>
  );
}
