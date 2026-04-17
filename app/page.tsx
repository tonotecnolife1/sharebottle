import { redirect } from "next/navigation";
import { getCurrentCast } from "@/lib/nightos/auth";
import { RoleSelector } from "./role-selector";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const cast = await getCurrentCast();
  if (!cast) {
    redirect("/auth/login");
  }

  return <RoleSelector />;
}
