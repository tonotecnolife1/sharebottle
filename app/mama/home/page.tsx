import { redirect } from "next/navigation";

/**
 * /mama/home is kept only as a legacy redirect.
 * Member management lives under /mama/team (linked from /store).
 */
export default function MamaHomePage() {
  redirect("/mama/team");
}
