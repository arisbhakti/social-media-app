import Link from "next/link";
import { IoAdd, IoHome, IoPerson } from "react-icons/io5";

import { Button } from "@/components/ui/button";

type HomeBottomNavProps = {
  activeTab?: "home" | "profile";
  homeHref?: string;
  profileHref?: string;
};

export function HomeBottomNav({
  activeTab = "home",
  homeHref = "/home",
  profileHref = "/myprofile",
}: HomeBottomNavProps) {
  const isHomeActive = activeTab === "home";
  const isProfileActive = activeTab === "profile";

  return (
    <nav
      aria-label="Home navigation"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 h-16 md:h-20"
    >
      <div className="pointer-events-auto flex w-full max-w-90 items-center justify-between rounded-full border border-neutral-900 bg-neutral-950 px-5 py-2 shadow-[0_20px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <Button
          asChild
          variant="ghost"
          className={`h-auto min-w-[96px] flex-col gap-1 rounded-full px-2 py-1 ${
            isHomeActive
              ? "text-[var(--primary-200)] hover:text-[var(--primary-200)]"
              : "text-[var(--base-pure-white)] hover:text-[var(--base-pure-white)]"
          } hover:bg-transparent`}
        >
          <Link
            href={homeHref}
            className="flex flex-col gap-0.5 md:gap-1"
            aria-current={isHomeActive ? "page" : undefined}
          >
            <span
              className={`flex size-6 items-center justify-center rounded-full ${
                isHomeActive
                  ? "bg-[rgba(127,81,249,0.22)]"
                  : "bg-[rgba(126,145,183,0.16)]"
              }`}
            >
              <IoHome className="size-5 md:size-6" />
            </span>
            <span className="text-xs md:text-md bold">Home</span>
          </Link>
        </Button>

        <Button
          asChild
          size="icon"
          aria-label="Create post"
          className="size-11 md:size-12 rounded-full bg-[linear-gradient(180deg,#7f51f9_0%,#6936f2_100%)] text-[var(--base-pure-white)] hover:bg-[linear-gradient(180deg,#7f51f9_0%,#6936f2_100%)]"
        >
          <Link href="/addpost">
            <IoAdd className="size-7" />
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className={`h-auto min-w-[96px] flex-col gap-1 rounded-full px-2 py-1 ${
            isProfileActive
              ? "text-[var(--primary-200)] hover:text-[var(--primary-200)]"
              : "text-[var(--base-pure-white)] hover:text-[var(--base-pure-white)]"
          } hover:bg-transparent`}
        >
          <Link
            href={profileHref}
            aria-current={isProfileActive ? "page" : undefined}
          >
            <IoPerson className="size-5 md:" />
            <span className="text-xs md:text-md bold">Profile</span>
          </Link>
        </Button>
      </div>
    </nav>
  );
}
