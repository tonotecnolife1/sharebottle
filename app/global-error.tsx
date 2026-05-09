"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/nightos/error-reporter";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, {
      scope: "app.global-error-boundary",
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <html lang="ja">
      <body className="bg-[#faf6f1] text-[#2b232a] font-sans">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-3">
            <h1
              className="text-[24px] leading-tight font-medium"
              style={{
                fontFamily:
                  '"Cormorant Garamond", "Noto Serif JP", Georgia, serif',
              }}
            >
              予期しないエラーが発生しました
            </h1>
            <p className="text-sm text-[#675d66] leading-relaxed">
              申し訳ございません。ページの読み込み中にエラーが発生しました。
              もう一度お試しください。
            </p>
            <button
              type="button"
              onClick={reset}
              className="px-6 py-3 rounded-full text-[#2b232a] font-medium"
              style={{
                background:
                  "linear-gradient(135deg, #f4d4cf 0%, #e8b9a5 100%)",
                boxShadow:
                  "0 4px 12px rgba(201, 141, 128, 0.14), 0 16px 32px rgba(201, 141, 128, 0.10)",
              }}
            >
              もう一度試す
            </button>
            {error.digest && (
              <p className="text-[10px] text-[#a39ba1] pt-3">
                参照ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
