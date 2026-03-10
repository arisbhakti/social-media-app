import { HomeBottomNav } from "@/components/site/home-bottom-nav";
import { HomeFeed } from "@/components/site/home/home-feed";

export default function HomePage() {
  return (
    <main className="flex w-full flex-1 justify-center px-4 py-4 pb-28 md:px-0 md:py-0">
      <HomeFeed />
      <HomeBottomNav />
    </main>
  );
}
