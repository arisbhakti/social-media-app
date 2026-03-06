import { ProfilePage } from "@/components/site/profile-page";
import { galleryPosts, likedPosts } from "@/lib/profile-mock";

type ProfileDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatNameFromId(id: string) {
  if (id.toLowerCase() === "id") {
    return "John Doe";
  }

  return id
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function ProfileDetailPage({
  params,
}: ProfileDetailPageProps) {
  const { id } = await params;
  const profileName = formatNameFromId(id);
  const username = profileName.toLowerCase().replace(/\s+/g, "");

  return (
    <ProfilePage
      mode="other"
      name={profileName || "John Doe"}
      username={username || "johndoe"}
      bio="Creating unforgettable moments with my favorite person! 📸✨ Let's cherish every second together!"
      stats={{
        post: 50,
        followers: 100,
        following: 43,
        likes: 567,
      }}
      galleryPosts={galleryPosts}
      secondaryPosts={likedPosts}
      initialFollowing={false}
    />
  );
}
