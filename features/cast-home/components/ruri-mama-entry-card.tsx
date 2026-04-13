import Link from "next/link";
import { Gem, Sparkles } from "lucide-react";
import { GemCard } from "@/components/nightos/card";

export function RuriMamaEntryCard() {
  return (
    <Link href="/cast/ruri-mama" className="block active:scale-[0.99] transition-transform">
      <GemCard className="p-5">
        {/* subtle shine decoration */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(400px_160px_at_120%_-20%,rgba(255,255,255,0.35),transparent_60%)]"
        />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
            <Gem size={22} className="text-pearl" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 text-label-sm text-pearl/90 uppercase tracking-wider">
              <Sparkles size={12} />
              Sakura Mama AI
            </div>
            <div className="text-display-sm font-display text-pearl">
              さくらママに相談する
            </div>
            <div className="text-body-sm text-pearl/80 mt-0.5">
              顧客の情報を参照して、具体的にアドバイスします
            </div>
          </div>
        </div>
      </GemCard>
    </Link>
  );
}
