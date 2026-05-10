import { StoreDashboardClub } from "@/features/store-dashboard/store-dashboard-club";
import { StoreDashboardCabaret } from "@/features/store-dashboard/store-dashboard-cabaret";
import { selectFollowTargets } from "@/features/cast-home/data/follow-selector";
import {
  MOCK_TODAY,
  mockBottles,
  mockCastMemos,
  mockVisits,
} from "@/lib/nightos/mock-data";
import {
  getAllCustomers,
  getStoreDashboardData,
} from "@/lib/nightos/supabase-queries";
import { getCurrentVenueType } from "@/lib/nightos/auth";

export default async function StoreDashboardPage() {
  const [data, customers, venueType] = await Promise.all([
    getStoreDashboardData(),
    getAllCustomers(),
    getCurrentVenueType(),
  ]);

  const today = process.env.NEXT_PUBLIC_SUPABASE_URL ? new Date() : MOCK_TODAY;
  const allTargets = selectFollowTargets({
    customers,
    visits: mockVisits,
    bottles: mockBottles,
    memos: mockCastMemos,
    today,
  });

  if (venueType === "cabaret") {
    return (
      <StoreDashboardCabaret
        data={data}
        customers={customers}
        allTargets={allTargets}
      />
    );
  }

  return (
    <StoreDashboardClub
      data={data}
      customers={customers}
      allTargets={allTargets}
    />
  );
}
