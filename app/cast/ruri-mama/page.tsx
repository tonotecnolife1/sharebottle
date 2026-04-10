import { PageHeader } from "@/components/nightos/page-header";
import { ChatWindow } from "@/features/ruri-mama/components/chat-window";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { getCustomersForCast } from "@/lib/nightos/supabase-queries";

export default async function RuriMamaPage() {
  const customers = await getCustomersForCast(CURRENT_CAST_ID);
  return (
    <div className="flex flex-col h-dvh animate-fade-in">
      <PageHeader title="瑠璃ママ" subtitle="銀座30年の経験者" showBack tone="ruri" />
      <ChatWindow customers={customers} />
    </div>
  );
}
