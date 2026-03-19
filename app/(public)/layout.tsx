import { TabBar } from "@/components/shared/tab-bar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh pb-20">
      <main className="mx-auto max-w-lg">{children}</main>
      <TabBar />
    </div>
  );
}
