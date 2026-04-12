import Link from "next/link";
import { History, ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/nightos/page-header";
import { ChatWindow } from "@/features/ruri-mama/components/chat-window";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { getCustomersForCast } from "@/lib/nightos/supabase-queries";

interface Props {
  searchParams: { customerId?: string };
}

export default async function RuriMamaPage({ searchParams }: Props) {
  const customers = await getCustomersForCast(CURRENT_CAST_ID);
  const isStubMode = !process.env.ANTHROPIC_API_KEY;

  return (
    <div className="flex flex-col h-dvh animate-fade-in">
      <PageHeader
        title="瑠璃ママ"
        subtitle="銀座30年の経験者"
        showBack
        tone="ruri"
        right={
          <div className="flex items-center gap-1">
            <Link
              href="/cast/ruri-mama/history"
              className="p-1.5 rounded-full hover:bg-white/15 text-pearl"
              aria-label="相談履歴"
              title="相談履歴"
            >
              <History size={18} />
            </Link>
            <Link
              href="/cast/avatars"
              className="p-1.5 rounded-full hover:bg-white/15 text-pearl"
              aria-label="イラスト変更"
              title="イラスト変更"
            >
              <ImageIcon size={18} />
            </Link>
          </div>
        }
      />
      <ChatWindow
        customers={customers}
        initialCustomerId={searchParams.customerId}
        initialIsStubMode={isStubMode}
      />
    </div>
  );
}
