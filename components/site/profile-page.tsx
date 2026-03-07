"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { useMemo, useState } from "react";
import {
  IoBookmarkOutline,
  IoCheckmarkCircleOutline,
  IoHeartOutline,
  IoPaperPlaneOutline,
} from "react-icons/io5";

import { HomeBottomNav } from "@/components/site/home-bottom-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ProfilePostItem = {
  id: number;
  src: string;
  alt: string;
};

type ProfilePageProps = {
  mode: "self" | "other";
  name: string;
  username: string;
  bio: string;
  avatarSrc?: string;
  stats: {
    post: number;
    followers: number;
    following: number;
    likes: number;
  };
  galleryPosts: ProfilePostItem[];
  secondaryPosts: ProfilePostItem[];
  initialFollowing?: boolean;
};

type ProfileTab = "gallery" | "secondary";

const statsOrder = [
  { key: "post", label: "Post" },
  { key: "followers", label: "Followers" },
  { key: "following", label: "Following" },
  { key: "likes", label: "Likes" },
] as const;

export function ProfilePage({
  mode,
  name,
  username,
  bio,
  avatarSrc = "/dummy-profile-image.png",
  stats,
  galleryPosts,
  secondaryPosts,
  initialFollowing = false,
}: ProfilePageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("gallery");
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const isOwnerProfile = mode === "self";
  const secondaryLabel = isOwnerProfile ? "Saved" : "Liked";

  const activePosts = useMemo(
    () => (activeTab === "gallery" ? galleryPosts : secondaryPosts),
    [activeTab, galleryPosts, secondaryPosts],
  );
  const shouldShowEmptyState = activePosts.length === 0;

  const renderActionButton = (isMobile = false) => {
    const widthClass = isMobile ? "flex-1" : "min-w-[130px] px-8";

    if (isOwnerProfile) {
      return (
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/editprofile")}
          className={cn(
            "h-10 md:h-12 rounded-full border border-neutral-900 bg-transparent font-bold text-sm md:text-md hover:bg-transparent",
            widthClass,
          )}
        >
          Edit Profile
        </Button>
      );
    }

    if (isFollowing) {
      return (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsFollowing(false)}
          className={cn(
            "h-10 md:h-12 rounded-full border border-neutral-900 bg-transparent text-sm md:text-md font-bold ",
            widthClass,
          )}
        >
          <IoCheckmarkCircleOutline className="size-5 md:size-6" />
          Following
        </Button>
      );
    }

    return (
      <Button
        type="button"
        onClick={() => setIsFollowing(true)}
        className={cn(
          "h-10 md:h-12 rounded-full bg-primary-300 text-sm md:text-md font-bold ",
          widthClass,
        )}
      >
        Follow
      </Button>
    );
  };

  return (
    <main className="flex w-full flex-1 justify-center px-4 pt-0 pb-28 md:px-0 md:pt-0 md:pb-32">
      <section className="w-full max-w-203">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 md:gap-5">
              <Avatar className="size-16 ">
                <AvatarImage src={avatarSrc} alt={name} />
                <AvatarFallback>
                  {name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="">
                <h1 className="text-sm md:text-md font-bold">{name}</h1>
                <p className="text-sm md:text-md">{username}</p>
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
              className="size-10 md:size-12 rounded-full border border-neutral-900 bg-transparent"
            >
              <IoPaperPlaneOutline className="size-5 md:size-6" />
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
            className="size-[42px] rounded-full border border-[rgba(126,145,183,0.2)] bg-transparent text-[var(--base-pure-white)] hover:bg-transparent"
          >
            <IoPaperPlaneOutline className="size-[18px]" />
          </Button>
        </div>

        <p className="mt-4 text-sm md:text-md">{bio}</p>

        <div className="mt-3 grid grid-cols-4">
          {statsOrder.map((item, index) => (
            <div
              key={item.key}
              className={cn(
                "flex flex-col items-center px-2",
                index < statsOrder.length - 1 &&
                  "border-r border-[rgba(126,145,183,0.2)]",
              )}
            >
              <p className="text-lg md:text-xl font-bold">{stats[item.key]}</p>
              <p className="text-xs md:text-md text-neutral-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 border-b border-[rgba(126,145,183,0.2)]">
          <div className="grid grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              className={cn(
                "flex items-center justify-center gap-2 border-b-2 py-3 text-sm md:text-md transition-colors",
                activeTab === "gallery"
                  ? "border-white text-white font-bold"
                  : "border-transparent text-neutral-400",
              )}
            >
              <LayoutGrid className="size-5" />
              Gallery
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("secondary")}
              className={cn(
                "flex items-center justify-center gap-2 border-b-2 py-3 text-sm md:text-md transition-colors",
                activeTab === "secondary"
                  ? "border-white text-white font-bold"
                  : "border-transparent text-neutral-400",
              )}
            >
              {isOwnerProfile ? (
                <IoBookmarkOutline className="size-5" />
              ) : (
                <IoHeartOutline className="size-5" />
              )}
              {secondaryLabel}
            </button>
          </div>
        </div>

        {shouldShowEmptyState ? (
          <div className="mx-auto flex min-h-[360px] max-w-113.25 flex-col items-center justify-center px-4  text-center md:min-h-[500px] md:pt-16">
            <h2 className="text-md md:text-lg font-bold">
              {isOwnerProfile ? "Your story starts here" : "No posts yet"}
            </h2>
            <p className="text-sm md:text-md text-neutral-400">
              {isOwnerProfile
                ? "Share your first post and let the world see your moments, passions, and memories. Make this space truly yours."
                : "This user has no posts in this tab yet."}
            </p>
            {isOwnerProfile ? (
              <Button
                type="button"
                className="mt-4 md:mt-6 h-10 md:h-12 w-full max-w-[420px] rounded-full bg-[linear-gradient(180deg,#7f51f9_0%,#6936f2_100%)] text-[16px] leading-[20px] font-semibold text-[var(--base-pure-white)] hover:bg-[linear-gradient(180deg,#7f51f9_0%,#6936f2_100%)] md:max-w-[259px]"
              >
                Upload My First Post
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-0.5 md:mt-6 md:gap-1">
            {activePosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square overflow-hidden"
              >
                <Image
                  src={post.src}
                  alt={post.alt}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover rounded-[2.67px] md:rounded-[6px]"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <HomeBottomNav activeTab="profile" />
    </main>
  );
}
