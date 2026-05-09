"use client";

import { Download, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISS_STORAGE_KEY = "nightos.install-prompt.dismissed-at";
const DISMISS_HIDE_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * PWA install prompt for Android Chrome / Edge.
 *
 * iOS Safari does not fire `beforeinstallprompt`; we show a separate
 * iOS hint when the user opens the app from Mobile Safari and isn't
 * already running standalone.
 *
 * Either banner can be dismissed; we remember that for 14 days so we
 * don't spam regular users.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Hide if already installed (running standalone)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari old non-standard
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Hide if recently dismissed
    const dismissedAt = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissedAt) {
      const daysAgo =
        (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysAgo < DISMISS_HIDE_DAYS) {
        setDismissed(true);
        return;
      }
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS detection — Safari only, no Chrome/CriOS in UA
    const ua = window.navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
    if (isIos) {
      // Delay so we don't pop up immediately on first navigation.
      const t = window.setTimeout(() => setShowIosHint(true), 4000);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    }
    setDeferred(null);
    setShowIosHint(false);
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setDeferred(null);
    } else {
      dismiss();
    }
  };

  // iOS Safari: navigator.share() opens the native share sheet where the user
  // can tap "ホーム画面に追加". This is the closest iOS allows programmatically.
  const shareToInstall = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({
        title: "NIGHTOS",
        url: window.location.origin,
      });
    } catch {
      // user cancelled share sheet — ignore
    }
  };

  if (dismissed) return null;

  if (deferred) {
    return (
      <PromptCard onDismiss={dismiss} onAction={install}>
        <div className="flex-1 min-w-0">
          <div className="text-body-sm font-medium text-ink">
            ホーム画面に追加できます
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">
            アプリのように起動できて、毎日の確認が早くなります
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); void install(); }}
          className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-pill bg-gradient-blush text-ink text-[12px] font-medium shadow-soft hover:brightness-[1.02] transition"
        >
          <Download size={12} />
          追加
        </button>
      </PromptCard>
    );
  }

  if (showIosHint) {
    return (
      <PromptCard onDismiss={dismiss} onAction={shareToInstall}>
        <div className="flex-1 min-w-0">
          <div className="text-body-sm font-medium text-ink">
            ホーム画面に追加
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
            「共有」→「ホーム画面に追加」をタップしてください
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); void shareToInstall(); }}
          className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-pill bg-gradient-blush text-ink text-[12px] font-medium shadow-soft hover:brightness-[1.02] transition"
        >
          <Share2 size={12} />
          共有
        </button>
      </PromptCard>
    );
  }

  return null;
}

function PromptCard({
  children,
  onDismiss,
  onAction,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
  onAction?: () => void;
}) {
  return (
    <div
      className="fixed left-3 right-3 bottom-3 z-40 mx-auto max-w-md rounded-card border border-gold/30 bg-pearl-warm/95 backdrop-blur-md p-3 shadow-warm cursor-pointer"
      role="dialog"
      aria-label="アプリのインストール"
      onClick={onAction}
    >
      <div className="flex items-start gap-3">
        {children}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          aria-label="閉じる"
          className="shrink-0 -mr-1 -mt-1 w-7 h-7 rounded-full text-ink-muted hover:text-ink hover:bg-pearl-soft flex items-center justify-center"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
