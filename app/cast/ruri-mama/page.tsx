import { PageHeader } from "@/components/nightos/page-header";
import { ChatWindow } from "@/features/ruri-mama/components/chat-window";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { getCustomersForCast } from "@/lib/nightos/supabase-queries";

interface Props {
  searchParams: { customerId?: string };
}

export default async function RuriMamaPage({ searchParams }: Props) {
  const customers = await getCustomersForCast(CURRENT_CAST_ID);
  // Detect server-side whether we're in stub mode. The chat window shows a
  // persistent banner starting from the very first render instead of only
  // after the user sends their first message.
  const isStubMode = !process.env.ANTHROPIC_API_KEY;

  return (
    <div className="flex flex-col h-dvh animate-fade-in">
      <PageHeader
        title="瑠璃ママ"
        subtitle="銀座30年の経験者"
        showBack
        tone="ruri"
      />
      <ChatWindow
        customers={customers}
        initialCustomerId={searchParams.customerId}
        initialIsStubMode={isStubMode}
      />
    </div>
  );
}
