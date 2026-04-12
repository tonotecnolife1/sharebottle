"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Sparkles } from "lucide-react";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { detectIntent } from "@/lib/nightos/intent-detector";
import { HEARING_FLOWS } from "../data/system-prompt";
import { ChatInput } from "./chat-input";
import { ChipOptions } from "./chip-options";
import { CustomerContextPicker } from "./customer-context-picker";
import { FeedbackButtons } from "./feedback-buttons";
import { MessageBubble } from "./message-bubble";
import type {
  ChatMessage,
  Customer,
  HearingFlow,
  Intent,
  RuriMamaResponse,
} from "@/types/nightos";

interface Props {
  customers: Customer[];
  initialCustomerId?: string;
  /**
   * True when the server detected no ANTHROPIC_API_KEY at page render.
   * The banner starts visible; it also flips to true if any individual
   * API response reports isStub:true (e.g. Claude call errored out).
   */
  initialIsStubMode?: boolean;
}

type HearingState =
  | { phase: "idle" }
  | {
      phase: "hearing";
      intent: Intent;
      flow: HearingFlow;
      step: number;
      answers: Record<string, string>;
      originalText: string;
    };

export function ChatWindow({
  customers,
  initialCustomerId,
  initialIsStubMode = false,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "いらっしゃい。今日はどんなことで悩んでるの？\n顧客のお名前を選んでおくと、カルテを見ながら具体的に答えられるわよ。",
    },
  ]);
  const [hearing, setHearing] = useState<HearingState>({ phase: "idle" });
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(initialCustomerId);
  const [loading, setLoading] = useState(false);
  const [stubMode, setStubMode] = useState(initialIsStubMode);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, hearing, loading]);

  const handleUserSend = (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    const intent = detectIntent(text);
    const flow = HEARING_FLOWS[intent];
    if (intent === "freeform" || flow.steps.length === 0) {
      // No hearing — go straight to API
      void callApi(text, intent, {});
      return;
    }
    setHearing({
      phase: "hearing",
      intent,
      flow,
      step: 0,
      answers: {},
      originalText: text,
    });
  };

  const handleChipPick = (value: string) => {
    if (hearing.phase !== "hearing") return;
    const { flow, step, answers, originalText, intent } = hearing;
    const stepDef = flow.steps[step];
    const nextAnswers = { ...answers, [stepDef.id]: value };
    const nextStep = step + 1;

    if (nextStep >= flow.steps.length) {
      setHearing({ phase: "idle" });
      void callApi(originalText, intent, nextAnswers);
    } else {
      setHearing({
        ...hearing,
        step: nextStep,
        answers: nextAnswers,
      });
    }
  };

  const handleSkipHearing = () => {
    if (hearing.phase !== "hearing") {
      // Triggered from the chat input when no hearing is active — fire the
      // most recent user text with freeform intent.
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (lastUser) {
        void callApi(lastUser.content, "freeform", {});
      }
      return;
    }
    const { originalText, intent } = hearing;
    setHearing({ phase: "idle" });
    void callApi(originalText, intent, {});
  };

  const callApi = async (
    userText: string,
    intent: Intent,
    hearingContext: Record<string, string>,
  ) => {
    setLoading(true);
    try {
      // Build history excluding the stub initial assistant greeting when
      // it's the only previous message (first turn).
      const history = messages.filter((_, i) => i !== 0 || messages.length > 1);
      const payloadMessages: ChatMessage[] = [
        ...history,
        { role: "user", content: userText },
      ];

      const res = await fetch("/api/ruri-mama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          customerId: selectedCustomerId,
          hearingContext,
          castId: CURRENT_CAST_ID,
          intent,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data: RuriMamaResponse = await res.json();
      // The API response is authoritative — if it says we're NOT in stub
      // mode, clear the banner even if the initial SSR detection thought
      // we were. This handles the case where the env var was set after the
      // deployment started but before the first request.
      setStubMode(data.isStub);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, isStub: data.isStub },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "ごめんなさい、今ちょっと電波が悪いみたい。もう一度送ってくれる？",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentHearingStep =
    hearing.phase === "hearing" ? hearing.flow.steps[hearing.step] : null;

  return (
    <div className="flex flex-col h-dvh">
      {/* Stub-mode banner */}
      {stubMode && (
        <div className="px-4 pt-3">
          <div className="flex items-start gap-2 rounded-btn bg-amber/10 border border-amber/40 text-ink px-3 py-2 text-body-sm">
            <Info size={14} className="mt-0.5 text-amber shrink-0" />
            <div className="leading-relaxed">
              <span className="font-semibold">デモ応答モード</span>です。
              本物の瑠璃ママ（Claude AI）を有効にするには、Vercel の
              環境変数に <code className="font-mono text-xs">ANTHROPIC_API_KEY</code> を設定して
              再デプロイしてください。
            </div>
          </div>
        </div>
      )}

      {/* Customer picker sticky below header */}
      <div className="px-4 pt-3 pb-2 bg-pearl/80 backdrop-blur-sm">
        <CustomerContextPicker
          customers={customers}
          selectedId={selectedCustomerId}
          onSelect={setSelectedCustomerId}
        />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.map((m, i) => (
          <div key={i} className="space-y-2">
            <MessageBubble message={m} />
            {m.role === "assistant" && i > 0 && <FeedbackButtons />}
          </div>
        ))}

        {currentHearingStep && (
          <ChipOptions
            question={currentHearingStep.question}
            options={currentHearingStep.options}
            onPick={handleChipPick}
            onSkip={handleSkipHearing}
          />
        )}

        {loading && (
          <div className="flex items-center gap-2 text-ink-muted text-body-sm pl-2">
            <Sparkles size={14} className="text-amethyst animate-shimmer" />
            瑠璃ママが考え中…
          </div>
        )}
      </div>

      <ChatInput
        onSend={handleUserSend}
        disabled={loading || hearing.phase === "hearing"}
        placeholder={
          hearing.phase === "hearing"
            ? "上の選択肢から選んでね"
            : "どんなことでも瑠璃ママに相談してね…"
        }
      />
    </div>
  );
}
