// Client-side only — do not import in server components

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

let _deferred: BeforeInstallPromptEvent | null = null;

export function captureInstallPrompt(e: Event) {
  e.preventDefault();
  _deferred = e as BeforeInstallPromptEvent;
  window.dispatchEvent(new CustomEvent("pwa-prompt-ready"));
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return _deferred;
}

export function clearInstallPrompt() {
  _deferred = null;
}

export function isInstalledPwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
}
