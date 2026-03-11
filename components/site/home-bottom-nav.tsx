import Link from "next/link";
import { IoAdd, IoHome, IoPerson } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
          className={cn(
            "group h-auto min-w-24 rounded-full px-2 py-1 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-transparent",
            isHomeActive
              ? "text-primary-200 hover:text-primary-200"
              : "text-base-pure-white hover:text-base-pure-white",
          )}
        >
          <Link
            href={homeHref}
            className="flex flex-col items-center gap-0.5 md:gap-1"
            aria-current={isHomeActive ? "page" : undefined}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-[0_10px_24px_rgba(105,54,242,0.4)]",
                isHomeActive
                  ? "bg-[rgba(127,81,249,0.22)] group-hover:bg-[rgba(127,81,249,0.34)]"
                  : "bg-[rgba(126,145,183,0.16)] group-hover:bg-[rgba(127,81,249,0.24)]",
              )}
            >
              <IoHome className="size-5 transition-transform duration-300 ease-out group-hover:scale-110 md:size-6" />
            </span>
            <span className="text-xs font-bold transition-colors duration-300 ease-out group-hover:text-primary-300 md:text-md">
              Home
            </span>
          </Link>
        </Button>

        <Button
          asChild
          size="icon"
          aria-label="Create post"
          className="group size-11 rounded-full bg-[linear-gradient(180deg,#7f51f9_0%,#6936f2_100%)] text-base-pure-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:bg-[linear-gradient(180deg,#7f51f9_0%,#6936f2_100%)] hover:shadow-[0_14px_30px_rgba(105,54,242,0.48)] md:size-12"
        >
          <Link href="/addpost" className="flex size-full items-center justify-center">
            <IoAdd className="size-7 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className={cn(
            "group h-auto min-w-24 rounded-full px-2 py-1 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-transparent",
            isProfileActive
              ? "text-primary-200 hover:text-primary-200"
              : "text-base-pure-white hover:text-base-pure-white",
          )}
        >
          <Link
            href={profileHref}
            className="flex flex-col items-center gap-0.5 md:gap-1"
            aria-current={isProfileActive ? "page" : undefined}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-[0_10px_24px_rgba(105,54,242,0.4)]",
                isProfileActive
                  ? "bg-[rgba(127,81,249,0.22)] group-hover:bg-[rgba(127,81,249,0.34)]"
                  : "bg-[rgba(126,145,183,0.16)] group-hover:bg-[rgba(127,81,249,0.24)]",
              )}
            >
              <IoPerson className="size-5 transition-transform duration-300 ease-out group-hover:scale-110 md:size-6" />
            </span>
            <span className="text-xs font-bold transition-colors duration-300 ease-out group-hover:text-primary-300 md:text-md">
              Profile
            </span>
          </Link>
        </Button>
      </div>
    </nav>
  );
}
