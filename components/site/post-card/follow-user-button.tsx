import { LoaderCircle } from "lucide-react";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

import { Button } from "@/components/ui/button";

type FollowUserButtonProps = {
  following: boolean;
  notFollowingLabel?: "Follow" | "Follow Back";
  disabled?: boolean;
  onToggle?: () => void;
};

export function FollowUserButton({
  following,
  notFollowingLabel = "Follow",
  disabled = false,
  onToggle,
}: FollowUserButtonProps) {
  if (following) {
    return (
      <Button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        variant="ghost"
        className="h-10 rounded-full border border-neutral-900 px-6 py-2 text-sm font-semibold disabled:opacity-75"
      >
        {disabled ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : (
          <IoCheckmarkCircleOutline className="size-5" />
        )}
        Following
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="h-10 rounded-full bg-primary-300 px-7 text-sm font-bold disabled:opacity-75"
    >
      {disabled ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {notFollowingLabel}
    </Button>
  );
}
