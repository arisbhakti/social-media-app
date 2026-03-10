"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IoArrowBackOutline,
  IoCloseOutline,
  IoMenuOutline,
  IoSearchOutline,
} from "react-icons/io5";

import { getAuthSession } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
        mobile ? "grid grid-cols-2 gap-3" : "gap-4",
      )}
    >
      <Button
        asChild
        variant="ghost"
        className={cn(
          "rounded-full border border-neutral-900 bg-transparent font-bold hover:scale-[1.01] hover:border-neutral-800 active:scale-[0.99]",
          mobile ? "h-10 w-full text-sm" : "h-11 min-w-32.5 px-8 text-md",
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
          mobile ? "h-10 w-full text-sm" : "h-11 min-w-32.5 px-8 text-md",
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
  const router = useRouter();
  const isProfileRoute =
    pathname === "/myprofile" ||
    pathname === "/editprofile" ||
    pathname === "/addpost" ||
    pathname.startsWith("/profile/");
  const profileTitle = getProfileTitle(pathname);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("John Doe");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isMobileGuestMenuOpen, setIsMobileGuestMenuOpen] = useState(false);

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
      setDisplayName(
        session.user?.name || session.user?.username || "John Doe",
      );
      setAvatarUrl(session.user?.avatarUrl ?? null);
    };

    syncAuthSession();
    window.addEventListener("storage", syncAuthSession);

    return () => {
      window.removeEventListener("storage", syncAuthSession);
    };
  }, []);

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

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex w-full flex-col bg-[var(--base-pure-black)] text-[var(--base-pure-white)]">
      <div className="hidden h-20 items-center justify-between px-30 py-0 md:flex">
        <div className="flex items-center gap-3">
          <Image
            src="/icon-sociality.svg"
            alt="Sociality icon"
            width={30}
            height={30}
            priority
          />
          <span className="display-xs leading-none font-bold">Sociality</span>
        </div>

        <div className="h-12 w-full max-w-122.75">
          <div className="relative w-full">
            <IoSearchOutline className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-[var(--neutral-500)]" />
            <Input
              type="search"
              placeholder="Search"
              aria-label="Search"
              className="h-12 rounded-full border-neutral-900 bg-neutral-950 px-4 pl-11 text-[14px] leading-[20px] text-[var(--base-pure-white)] shadow-none placeholder:text-[var(--neutral-500)] focus-visible:border-[rgba(126,145,183,0.48)] focus-visible:ring-0"
            />
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
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Image
                src="/icon-sociality.svg"
                alt="Sociality icon"
                width={30}
                height={30}
                priority
              />
              <span className="display-xs leading-none font-bold">
                Sociality
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Open search"
                className="size-5 text-neutral-25"
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
                  aria-label={
                    isMobileGuestMenuOpen ? "Close menu" : "Open menu"
                  }
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
              : "pointer-events-none max-h-0 overflow-hidden pb-0 opacity-0",
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
