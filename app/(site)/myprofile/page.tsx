import { ProfilePage } from "@/components/site/profile-page";
import { galleryPosts, myProfileData, savedPosts } from "@/lib/profile-mock";

export default function MyProfilePage() {
  return (
    <ProfilePage
      mode="self"
      name={myProfileData.name}
      username={myProfileData.username}
      bio={myProfileData.bio}
      stats={myProfileData.stats}
      galleryPosts={galleryPosts}
      secondaryPosts={savedPosts}
    />
  );
}
