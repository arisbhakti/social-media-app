import { ProfilePage } from "@/components/site/profile-page";
import { galleryPosts, savedPosts } from "@/lib/profile-mock";

const MY_PROFILE_DATA = {
  name: "John Doe",
  username: "johndoe",
  bio: "Creating unforgettable moments with my favorite person! 📸✨ Let's cherish every second together!",
  stats: {
    post: 50,
    followers: 100,
    following: 43,
    likes: 567,
  },
};

export default function MyProfilePage() {
  return (
    <ProfilePage
      mode="self"
      name={MY_PROFILE_DATA.name}
      username={MY_PROFILE_DATA.username}
      bio={MY_PROFILE_DATA.bio}
      stats={MY_PROFILE_DATA.stats}
      galleryPosts={galleryPosts}
      secondaryPosts={savedPosts}
    />
  );
}
