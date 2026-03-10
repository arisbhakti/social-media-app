import type { CommentItem } from "@/components/site/post-card/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type CommentRowProps = {
  item: CommentItem;
};

export function CommentRow({ item }: CommentRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-neutral-900 pb-3 last:border-b-0 last:pb-0 md:gap-2.5 md:pb-4">
      <div className="flex items-center gap-2">
        <Avatar className="size-10">
          <AvatarImage src="/dummy-profile-image.png" alt={item.name} />
          <AvatarFallback>{item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="grid gap-0">
          <span className="-mb-1 text-xs font-bold md:-mb-0.5 md:text-sm">
            {item.name}
          </span>
          <span className="text-xs text-neutral-400">{item.createdAt}</span>
        </div>
      </div>
      <p className="text-sm">{item.content}</p>
    </div>
  );
}
