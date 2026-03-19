import { getMyBottlesData } from "@/features/my-bottles/actions";
import { MyBottlesContent } from "@/features/my-bottles/components/my-bottles-content";

export default async function MyBottlesPage() {
  const { bottles, summary, addCandidates } = await getMyBottlesData();

  return (
    <MyBottlesContent
      bottles={bottles}
      summary={summary}
      addCandidates={addCandidates}
    />
  );
}
