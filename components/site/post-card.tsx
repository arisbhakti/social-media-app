"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  IoBookmarkOutline,
  IoChatbubbleOutline,
  IoCheckmarkCircleOutline,
  IoClose,
  IoHeart,
  IoHeartOutline,
  IoPaperPlaneOutline,
} from "react-icons/io5";

import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";

type PostCardProps = {
  imageSrc: string;
  imageAlt: string;
  liked?: boolean;
};

type LikeUser = {
  id: number;
  name: string;
  username: string;
  following: boolean;
};

const LIKED_BY_USERS: LikeUser[] = [
  { id: 1, name: "John Doe", username: "johndoe", following: true },
  { id: 2, name: "John Doe", username: "johndoe", following: true },
  { id: 3, name: "John Doe", username: "johndoe", following: false },
  { id: 4, name: "John Doe", username: "johndoe", following: false },
  { id: 5, name: "John Doe", username: "johndoe", following: false },
  { id: 6, name: "John Doe", username: "johndoe", following: false },
];

function ActionButton({
  label,
  count,
  icon,
  onClick,
}: {
  label: string;
  count: number;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      onClick={onClick}
      className="h-auto gap-1.5 rounded-none p-0 text-[var(--base-pure-white)] hover:bg-transparent hover:text-[var(--base-pure-white)]"
    >
      <span className="flex size-5 items-center justify-center">{icon}</span>
      <span className="text-[18px] leading-[20px]">{count}</span>
    </Button>
  );
}

function FollowUserButton({ following }: { following: boolean }) {
  if (following) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="h-[48px] min-w-[144px] rounded-full border border-[rgba(126,145,183,0.2)] bg-transparent px-5 text-[16px] leading-[20px] font-semibold text-[var(--base-pure-white)] hover:bg-transparent hover:text-[var(--base-pure-white)]"
      >
        <IoCheckmarkCircleOutline className="size-5" />
        Following
      </Button>
    );
  }

  return (
    <Button
      type="button"
      className="h-[48px] min-w-[144px] rounded-full bg-[linear-gradient(180deg,#7f51f9_0%,#6936f2_100%)] px-7 text-[16px] leading-[20px] font-semibold text-[var(--base-pure-white)] hover:bg-[linear-gradient(180deg,#7f51f9_0%,#6936f2_100%)]"
    >
      Follow
    </Button>
  );
}

function LikesList() {
  return (
    <div className="flex max-h-[65vh] flex-col overflow-hidden rounded-[20px] border border-[rgba(126,145,183,0.2)] bg-[rgba(2,8,20,0.98)]">
      <div className="px-6 pt-6 pb-3">
        <h2 className="text-[20px] leading-[24px] font-semibold text-[var(--base-pure-white)]">
          Likes
        </h2>
      </div>
      <div className="grid gap-2 overflow-y-auto px-4 pb-5 sm:px-6">
        {LIKED_BY_USERS.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between gap-3 rounded-[14px] py-1.5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <Avatar className="size-[52px] border border-[rgba(126,145,183,0.24)]">
                  <AvatarImage src="/dummy-profile-image.png" alt={user.name} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-[20px] leading-[24px] font-bold text-[var(--base-pure-white)]">
                    {user.name}
                  </p>
                  <p className="truncate text-[16px] leading-[20px] text-[var(--neutral-500)]">
                    {user.username}
                  </p>
                </div>
              </div>
            </div>
            <FollowUserButton following={user.following} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PostCard({ imageSrc, imageAlt, liked = false }: PostCardProps) {
  const [isLikesOpen, setIsLikesOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <Card className="gap-3 rounded-none border-0 bg-transparent py-0 text-[var(--base-pure-white)] shadow-none">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-10 border border-[rgba(126,145,183,0.32)]">
            <AvatarImage src="/dummy-profile-image.png" alt="Johndoe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="grid gap-0">
            <span className="text-[20px] leading-[24px] font-bold">Johndoe</span>
            <span className="text-[14px] leading-[18px] text-[var(--neutral-500)]">
              1 Minutes Ago
            </span>
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-[10px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1000}
            height={1000}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ActionButton
              label="Open likes list"
              count={20}
              onClick={() => setIsLikesOpen(true)}
              icon={
                liked ? (
                  <IoHeart className="size-[19px] text-[var(--red)]" />
                ) : (
                  <IoHeartOutline className="size-[19px]" />
                )
              }
            />
            <ActionButton
              label="Open comments"
              count={20}
              icon={<IoChatbubbleOutline className="size-[18px]" />}
            />
            <ActionButton
              label="Share post"
              count={20}
              icon={<IoPaperPlaneOutline className="size-[19px]" />}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Save post"
            className="size-5 rounded-none p-0 text-[var(--base-pure-white)] hover:bg-transparent"
          >
            <IoBookmarkOutline className="size-[18px]" />
          </Button>
        </div>

        <div className="grid gap-1">
          <span className="text-[18px] leading-[22px] font-bold">Johndoe</span>
          <p className="text-[14px] leading-[28px] text-[var(--neutral-700)]">
            Creating unforgettable moments with my favorite person! Let&apos;s
            cherish every second together! ...
          </p>
          <Button
            type="button"
            variant="link"
            className="h-auto w-fit p-0 text-[18px] leading-[22px] font-semibold text-[var(--primary-200)]"
          >
            Show More
          </Button>
        </div>
      </Card>

      {isMobile ? (
        <Drawer open={isLikesOpen} onOpenChange={setIsLikesOpen}>
          <DrawerContent className="max-h-[85vh] border-t border-t-[rgba(126,145,183,0.2)] bg-[rgba(2,8,20,0.98)] p-0 text-[var(--base-pure-white)]">
            <DrawerTitle className="sr-only">Likes</DrawerTitle>
            <div className="relative px-4 pt-5 pb-4">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close likes list"
                onClick={() => setIsLikesOpen(false)}
                className="absolute top-5 right-5 z-10 size-8 rounded-full p-0 text-[var(--base-pure-white)] hover:bg-transparent"
              >
                <IoClose className="size-8" />
              </Button>
              <LikesList />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isLikesOpen} onOpenChange={setIsLikesOpen}>
          <DialogContent
            showCloseButton={false}
            className="w-[min(700px,calc(100%-2rem))] border-0 bg-transparent p-0 text-[var(--base-pure-white)] shadow-none"
          >
            <DialogTitle className="sr-only">Likes</DialogTitle>
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close likes list"
                onClick={() => setIsLikesOpen(false)}
                className="absolute top-4 right-4 z-10 size-8 rounded-full p-0 text-[var(--base-pure-white)] hover:bg-transparent"
              >
                <IoClose className="size-8" />
              </Button>
              <LikesList />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
