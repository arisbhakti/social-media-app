import type { ReactNode } from "react";
import Image from "next/image";
import {
  IoBookmarkOutline,
  IoChatbubbleOutline,
  IoHeart,
  IoHeartOutline,
  IoPaperPlaneOutline,
} from "react-icons/io5";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PostCardProps = {
  imageSrc: string;
  imageAlt: string;
  liked?: boolean;
};

function ActionButton({
  label,
  count,
  icon,
}: {
  label: string;
  count: number;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        className="size-5 rounded-none p-0 text-[var(--base-pure-white)] hover:bg-transparent"
      >
        {icon}
      </Button>
      <span className="text-[18px] leading-[20px]">{count}</span>
    </div>
  );
}

export function PostCard({ imageSrc, imageAlt, liked = false }: PostCardProps) {
  return (
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
            label={liked ? "Unlike post" : "Like post"}
            count={20}
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
  );
}
