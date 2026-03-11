import type { CommentItem } from "@/components/site/post-card/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IoTrashOutline } from "react-icons/io5";

type CommentRowProps = {
  item: CommentItem;
  canDelete?: boolean;
  isDeletePending?: boolean;
  onDelete?: (item: CommentItem) => void;
};

export function CommentRow({
  item,
  canDelete = false,
  isDeletePending = false,
  onDelete,
}: CommentRowProps) {
  const avatarFallback =
    item.name.trim().slice(0, 2).toUpperCase() || "U";

  return (
    <div className="flex flex-col gap-2 border-b border-neutral-900 pb-3 last:border-b-0 last:pb-0 md:gap-2.5 md:pb-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="size-10">
            <AvatarImage
              src={item.avatarUrl ?? "/dummy-profile-image.png"}
              alt={item.name}
            />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0">
            <span className="-mb-1 text-xs font-bold md:-mb-0.5 md:text-sm">
              {item.name}
            </span>
            <span className="text-xs text-neutral-400">{item.createdAt}</span>
          </div>
        </div>

        {canDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Delete comment"
            onClick={() => onDelete?.(item)}
            disabled={isDeletePending}
            className="size-8 shrink-0 rounded-full p-0 text-[var(--base-pure-white)] transition-colors hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--red)] disabled:opacity-60"
          >
            <IoTrashOutline className="size-5" />
          </Button>
        ) : null}
      </div>
      <p className="text-sm">{item.content}</p>
    </div>
  );
}
