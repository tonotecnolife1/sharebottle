import { getBottleMenu } from "@/features/home/actions";
import { HomeContent } from "@/features/home/components/home-content";

export default async function HomePage() {
  const { items, summary } = await getBottleMenu();

  return <HomeContent items={items} summary={summary} />;
}
