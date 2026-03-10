import { IoCheckmarkCircleOutline } from "react-icons/io5";

import { Button } from "@/components/ui/button";

type FollowUserButtonProps = {
  following: boolean;
};

export function FollowUserButton({ following }: FollowUserButtonProps) {
  if (following) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="h-10 rounded-full border border-neutral-900 px-7 py-2 text-sm font-semibold"
      >
        <IoCheckmarkCircleOutline className="size-5" />
        Following
      </Button>
    );
  }

  return (
    <Button
      type="button"
      className="h-10 rounded-full bg-primary-300 px-7 text-sm font-bold"
    >
      Follow
    </Button>
  );
}
