"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { IoArrowBackOutline, IoSearchOutline } from "react-icons/io5";

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

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isProfileRoute =
    pathname === "/myprofile" ||
    pathname === "/editprofile" ||
    pathname === "/addpost" ||
    pathname.startsWith("/profile/");
  const profileTitle = getProfileTitle(pathname);

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

        <div className="w-full max-w-122.75 h-12">
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

        <div className="flex items-center gap-2">
          <Avatar className="size-12 border border-[rgba(126,145,183,0.32)]">
            <AvatarImage src="/dummy-profile-image.png" alt="John Doe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span className="text-md font-bold">John Doe</span>
        </div>
      </div>

      <div className="flex h-16 items-center justify-between px-4 py-0 md:hidden">
        {isProfileRoute ? (
          <>
            <div className="flex min-w-0 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Go back"
                onClick={handleBack}
                className="size-8 rounded-full p-0 text-[var(--base-pure-white)] hover:bg-[rgba(126,145,183,0.18)]"
              >
                <IoArrowBackOutline className="size-[20px]" />
              </Button>
              <span className="truncate text-[26px] leading-[30px] font-bold">
                {profileTitle}
              </span>
            </div>

            <Avatar className="size-8 border border-[rgba(126,145,183,0.32)]">
              <AvatarImage src="/dummy-profile-image.png" alt="John Doe" />
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
              <Avatar className="size-10 border border-[rgba(126,145,183,0.32)]">
                <AvatarImage src="/dummy-profile-image.png" alt="John Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </>
        )}
      </div>
      <Separator className="bg-[rgba(126,145,183,0.2)]" />
    </header>
  );
}
