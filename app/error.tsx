"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="text-3xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold text-ink mb-2">
          ページの読み込みに失敗しました
        </h2>
        <p className="text-sm text-ink-secondary mb-5 leading-relaxed">
          通信状況を確認して、もう一度お試しください。
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 rounded-btn bg-gradient-to-r from-[#9a7bbb] to-[#c98d80] text-white font-medium shadow-soft-card active:scale-95 transition-transform"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
