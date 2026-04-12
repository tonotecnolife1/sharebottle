import { RuriMamaAvatar } from "@/components/nightos/ruri-mama-avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/nightos";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl px-4 py-3 text-body-md whitespace-pre-wrap leading-relaxed shadow-soft-card rose-gradient text-pearl rounded-br-sm">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message — show Ruri-Mama avatar to the left
  return (
    <div className="flex justify-start gap-2 items-end">
      <RuriMamaAvatar size={32} className="mb-1" />
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-body-md whitespace-pre-wrap leading-relaxed shadow-soft-card",
          "bg-pearl-warm border border-amethyst-border text-ink rounded-bl-sm",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
