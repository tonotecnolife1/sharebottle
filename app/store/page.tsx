"use client";

import Link from "next/link";
import { Hammer } from "lucide-react";
import { Button } from "@/components/nightos/button";
import { Card } from "@/components/nightos/card";
import { clearRole } from "@/lib/nightos/role-store";
import { useRouter } from "next/navigation";

export default function StorePlaceholderPage() {
  const router = useRouter();
  return (
    <main className="pearl-sheen min-h-dvh flex items-center justify-center px-6 py-12">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-champagne-light mb-4">
          <Hammer size={24} className="text-roseGold-dark" />
        </div>
        <h1 className="text-display-sm text-ink mb-2">店舗向け画面は準備中</h1>
        <p className="text-body-md text-ink-secondary mb-6 leading-relaxed">
          顧客登録・来店登録・ボトル登録・ダッシュボードは
          <br />
          次のイテレーションで実装します。
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/cast/home">
            <Button variant="primary" fullWidth>
              キャスト画面を見る
            </Button>
          </Link>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              clearRole();
              router.push("/");
            }}
          >
            ロールを選び直す
          </Button>
        </div>
      </Card>
    </main>
  );
}
