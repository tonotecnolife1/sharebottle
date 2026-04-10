import { getUserProfile } from "@/features/my-page/actions";
import { MyPageContent } from "@/features/my-page/components/my-page-content";

export default async function MyPagePage() {
  const profile = await getUserProfile();

  return <MyPageContent profile={profile} />;
}
