import { LIKED_BY_USERS } from "@/components/site/post-card/constants";
import { FollowUserButton } from "@/components/site/post-card/follow-user-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LikesList() {
  return (
    <div className="flex flex-col overflow-hidden bg-neutral-950 text-neutral-25">
      <div className="md:px-6 md:pt-6 md:pb-0">
        <h2 className="text-md md:text-xl font-bold">Likes</h2>
      </div>
      <div className="grid gap-2 overflow-y-auto md:p-5 md:pt-2">
        {LIKED_BY_USERS.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between gap-3 rounded-[14px] py-1.5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Avatar className="size-12 border border-[rgba(126,145,183,0.24)]">
                  <AvatarImage src="/dummy-profile-image.png" alt={user.name} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="text-sm text-neutral-400">{user.username}</p>
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
