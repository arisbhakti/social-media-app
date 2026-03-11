"use client";

import { usePathname } from "next/navigation";

import { HomeBottomNav } from "@/components/site/home-bottom-nav";

const HOME_TAB_ROUTES = new Set(["/", "/home", "/addpost", "/search"]);

function shouldShowBottomNav(pathname: string) {
  return (
    HOME_TAB_ROUTES.has(pathname) ||
    pathname === "/myprofile" ||
    pathname.startsWith("/profile/")
  );
}

export function SiteBottomNav() {
  const pathname = usePathname();

  if (!shouldShowBottomNav(pathname)) {
    return null;
  }

  const activeTab =
    pathname === "/myprofile" || pathname.startsWith("/profile/")
      ? "profile"
      : "home";

  return <HomeBottomNav activeTab={activeTab} />;
}
