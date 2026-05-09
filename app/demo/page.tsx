import { isMockAuthDisabled } from "@/lib/nightos/env";
import { DemoClient } from "./demo-client";
import { redirect } from "next/navigation";

export default function DemoPage() {
  if (isMockAuthDisabled()) {
    redirect("/auth/login");
  }
  return <DemoClient />;
}
