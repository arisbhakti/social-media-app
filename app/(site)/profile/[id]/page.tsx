import { ProfilePage } from "@/components/site/profile-page";

type ProfileDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProfileDetailPage({
  params,
}: ProfileDetailPageProps) {
  const { id } = await params;
  const normalizedUsername = decodeURIComponent(id).trim();

  return <ProfilePage username={normalizedUsername} />;
}
