import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/nightos";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-3 text-body-md whitespace-pre-wrap leading-relaxed shadow-soft-card",
          isUser
            ? "rose-gradient text-pearl rounded-br-sm"
            : "bg-pearl-warm border border-amethyst-border text-ink rounded-bl-sm",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
