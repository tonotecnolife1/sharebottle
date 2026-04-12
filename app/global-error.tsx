"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="bg-[#faf7f2] text-[#2b232a] font-sans">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="text-4xl mb-4">😵</div>
            <h1 className="text-xl font-bold mb-2">
              予期しないエラーが発生しました
            </h1>
            <p className="text-sm text-[#675d66] mb-6 leading-relaxed">
              申し訳ございません。ページの読み込み中にエラーが発生しました。
              もう一度お試しください。
            </p>
            <button
              type="button"
              onClick={reset}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#9a7bbb] to-[#c98d80] text-white font-semibold shadow-lg active:scale-95 transition-transform"
            >
              もう一度試す
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
