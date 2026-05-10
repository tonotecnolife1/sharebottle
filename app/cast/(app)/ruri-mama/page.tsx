import Link from "next/link";
import { History, ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/nightos/page-header";
import { ChatWindow } from "@/features/ruri-mama/components/chat-window";
import { ChatLimitBanner } from "@/features/ruri-mama/components/chat-limit-banner";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { getCustomersForCast } from "@/lib/nightos/supabase-queries";

interface Props {
  searchParams: { customerId?: string };
}

export default async function RuriMamaPage({ searchParams }: Props) {
  const castId = await getCurrentCastId();
  const customers = await getCustomersForCast(castId);
  const isStubMode = !process.env.ANTHROPIC_API_KEY;

  return (
    <div className="flex flex-col h-dvh animate-fade-in">
      <PageHeader
        title="さくらママ"
        subtitle="銀座30年の経験者"
        showBack
        tone="ruri"
        right={
          <div className="flex items-center gap-2">
            <Link
              href="/cast/ruri-mama/history"
              className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg hover:bg-white/15 text-pearl"
              aria-label="相談履歴"
            >
              <History size={16} />
              <span className="text-[9px] leading-none opacity-80">履歴</span>
            </Link>
            <Link
              href="/cast/avatars"
              className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg hover:bg-white/15 text-pearl"
              aria-label="イラスト変更"
            >
              <ImageIcon size={16} />
              <span className="text-[9px] leading-none opacity-80">アバター</span>
            </Link>
          </div>
        }
      />
      <ChatLimitBanner />
      <ChatWindow
        customers={customers}
        initialCustomerId={searchParams.customerId}
        initialIsStubMode={isStubMode}
      />
    </div>
  );
}
