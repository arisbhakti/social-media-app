"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { HomeBottomNav } from "@/components/site/home-bottom-nav";
import { HomeFeed } from "@/components/site/home/home-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthSession } from "@/lib/auth-session";

function HomePageSkeleton() {
  return (
    <section className="flex w-full max-w-[600px] flex-col gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={`home-guard-skeleton-${index}`} className="grid gap-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-full md:size-16" />
            <div className="grid gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </section>
  );
}

export default function HomeRoutePage() {
  const router = useRouter();
  const isAuthorized = useSyncExternalStore(
    () => () => undefined,
    () => Boolean(getAuthSession()?.token),
    () => false
  );

  useEffect(() => {
    if (!isAuthorized) {
      router.replace("/login");
    }
  }, [isAuthorized, router]);

  if (!isAuthorized) {
    return (
      <main className="flex w-full flex-1 justify-center px-4 py-4 pb-28 md:px-0 md:py-0">
        <HomePageSkeleton />
      </main>
    );
  }

  return (
    <main className="flex w-full flex-1 justify-center px-4 py-4 pb-28 md:px-0 md:py-0">
      <HomeFeed />
      <HomeBottomNav />
    </main>
  );
}
