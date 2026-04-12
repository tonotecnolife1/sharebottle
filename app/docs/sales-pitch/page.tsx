import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Heart,
  MessageCircle,
  Mic,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wine,
  Zap,
} from "lucide-react";

export default function SalesPitchDoc() {
  return (
    <div className="bg-white min-h-screen text-[#2b232a]" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>
      {/* Cover */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-[#f8f4ef] via-[#f0e8e0] to-[#e4d8c8] print:break-after-page">
        <div className="text-center max-w-lg">
          <h1 className="text-6xl font-bold tracking-tight mb-2" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            NIGHTOS
          </h1>
          <div className="w-20 h-0.5 bg-[#c9a84c] mx-auto my-4" />
          <p className="text-2xl font-semibold mb-3">
            店舗が入力するだけで、<br />キャストの売上が上がる
          </p>
          <p className="text-base text-[#675d66]">
            夜のお店のための AI ワークスペース
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <CoverStat value="80%" label="フォロー率" sub="30%→" />
            <CoverStat value="+15%" label="リピート率" sub="改善" />
            <CoverStat value="5分" label="1日の入力" sub="店舗スタッフ" />
          </div>
        </div>
      </section>

      {/* Value for each stakeholder */}
      <section className="px-8 py-16 max-w-3xl mx-auto print:break-after-page">
        <h2 className="text-2xl font-bold text-center mb-10">
          👥 誰にどんな価値があるか
        </h2>
        <div className="space-y-6">
          <StakeholderCard
            icon={<Users />}
            color="#c9a84c"
            role="店舗オーナー / 店長"
            benefits={[
              { before: "フォロー状況が見えない", after: "全キャストのフォロー率を可視化" },
              { before: "ベテラン退職で情報消失", after: "カルテに蓄積、引継ぎ容易" },
              { before: "新人教育に時間がかかる", after: "AIが指示 → 即戦力化" },
              { before: "売上の原因分析が勘", after: "ARPU・リピート率で数字判断" },
            ]}
          />
          <StakeholderCard
            icon={<Sparkles />}
            color="#c98d80"
            role="キャスト"
            benefits={[
              { before: "誰に連絡するか自分で考える", after: "AIが今日の対象を自動選定" },
              { before: "LINE文面を毎回考える", after: "テンプレに名前・話題が自動挿入" },
              { before: "接客中に相談できない", after: "瑠璃ママAIに即座に相談" },
              { before: "成績が見えない", after: "目標進捗・トレンドがグラフで" },
            ]}
          />
          <StakeholderCard
            icon={<Heart />}
            color="#9a7bbb"
            role="来店客"
            benefits={[
              { before: "ボトル残量が分からない", after: "アプリで残杯数を確認" },
              { before: "特典がない", after: "来店回数でクーポン自動発行" },
              { before: "どの店に何があるか不明", after: "複数店舗のボトルを一元管理" },
            ]}
          />
        </div>
      </section>

      {/* AI Feature spotlight */}
      <section className="px-8 py-16 bg-gradient-to-br from-[#9a7bbb]/5 to-[#c98d80]/5 print:break-after-page">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">
            🔮 瑠璃ママAI — 銀座30年の知見
          </h2>
          <p className="text-center text-[#675d66] mb-10">
            一般的なAIではなく、夜の世界を知っている人のアドバイス
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <AIScenario emoji="💌" title="お礼LINE" desc="来店翌日に、顧客カルテを見ながら具体的な文面を提案。ボトル残量も自然に織り込む" />
            <AIScenario emoji="🎯" title="指名化戦略" desc="新規3回目の壁を越える具体的な会話テクニック。「続きを話す約束」で自然に次回も呼ぶ" />
            <AIScenario emoji="🔴" title="VIP離脱防止" desc="来店間隔が空いたVIPへの最適な連絡。焦らず安全な話題で「覚えてる」を伝える" />
            <AIScenario emoji="😤" title="機嫌が悪い客" desc="接客中の急ぎ相談に1問で即答。30分待って好きな話題で空気を変える" />
            <AIScenario emoji="🎂" title="誕生日演出" desc="2週間前から自動検知。お祝いを口実に来店を誘う文面を提案" />
            <AIScenario emoji="📷" title="LINEスクショ解析" desc="LINEの会話スクショを貼ると、AIが読み取ってメモを自動更新" />
          </div>
        </div>
      </section>

      {/* Feature overview with icons */}
      <section className="px-8 py-16 max-w-3xl mx-auto print:break-after-page">
        <h2 className="text-2xl font-bold text-center mb-10">
          📱 主な機能
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#c98d80]">💃 キャスト向け</h3>
            <FeatureList items={[
              { icon: <Bell size={16} />, text: "来店通知（30秒で自動配信）" },
              { icon: <Calendar size={16} />, text: "フォロー対象リスト（AI自動選定）" },
              { icon: <MessageCircle size={16} />, text: "テンプレート（名前・話題自動挿入）" },
              { icon: <Sparkles size={16} />, text: "瑠璃ママAIチャット（選択式+音声入力）" },
              { icon: <Camera size={16} />, text: "LINEスクショ → メモ自動更新" },
              { icon: <BarChart3 size={16} />, text: "成績ダッシュボード（目標進捗）" },
              { icon: <Users size={16} />, text: "顧客管理（フィルタ・優先度・アクション）" },
            ]} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#c9a84c]">🏢 店舗向け</h3>
            <FeatureList items={[
              { icon: <Users size={16} />, text: "顧客登録・編集・管理（2分/人）" },
              { icon: <Clock size={16} />, text: "来店登録（15秒、テーブル選択式）" },
              { icon: <Wine size={16} />, text: "ボトル管理（残量・消費記録）" },
              { icon: <TrendingUp size={16} />, text: "効果ダッシュボード（KPI一覧）" },
              { icon: <BarChart3 size={16} />, text: "キャスト別 ROI・ARPU 分析" },
              { icon: <Zap size={16} />, text: "離脱リスク顧客の自動検知" },
              { icon: <MessageCircle size={16} />, text: "キャストへの連絡機能" },
            ]} />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-8 py-16 bg-[#faf7f2] print:break-after-page">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">💰 料金</h2>
          <div className="inline-block rounded-2xl bg-gradient-to-br from-[#f7f0de] to-[#f0e4cc] border border-[#c9a84c]/20 p-8 shadow-sm">
            <div className="text-5xl font-bold" style={{ fontFamily: '"Cormorant Garamond", serif' }}>¥0</div>
            <div className="text-lg font-semibold mt-2">MVP検証版 — 無料</div>
            <div className="text-sm text-[#675d66] mt-3 space-y-1">
              <p>✓ 全機能利用可能</p>
              <p>✓ AI機能込み（月額約1,000円分を負担）</p>
              <p>✓ 導入サポート付き</p>
              <p>✓ いつでも解約可能</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-8 py-16 max-w-3xl mx-auto print:break-after-page">
        <h2 className="text-2xl font-bold text-center mb-8">❓ よくある質問</h2>
        <div className="space-y-4">
          <FAQ q="スマホだけで使えますか？" a="はい。iPhone/Androidのブラウザだけで動きます。専用アプリのインストールは不要です。" />
          <FAQ q="キャストが嫌がりませんか？" a="キャストの入力作業はゼロ。「見るだけ」で使えるので、むしろ楽になると好評です。" />
          <FAQ q="顧客の個人情報は大丈夫？" a="名前・好みの程度のみ。住所や電話番号は扱いません。クラウドに暗号化保存、他店からはアクセス不可。" />
          <FAQ q="既存のPOSと競合しますか？" a="しません。「フォロー支援+AI」に特化。会計機能はないので並行利用が前提です。" />
          <FAQ q="テスト後に断れますか？" a="はい。テスト後の継続は任意。データ削除もリクエストに応じます。" />
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 text-center bg-gradient-to-br from-[#9a7bbb]/10 to-[#c98d80]/10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            まずはデモをご覧ください
          </h2>
          <p className="text-[#675d66] mb-8">
            スマホで実際に動くアプリをお見せします。<br />
            5分で「これは使える」と感じていただけるはずです。
          </p>
          <div className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-[#9a7bbb] to-[#c98d80] text-white font-semibold text-xl shadow-lg">
            デモを予約する
            <ArrowRight size={20} />
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════ Sub-components ═══════════════

function CoverStat({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-[#2b232a]" style={{ fontFamily: '"Cormorant Garamond", serif' }}>{value}</div>
      <div className="text-sm font-medium text-[#675d66]">{label}</div>
      <div className="text-[10px] text-[#a39ba1]">{sub}</div>
    </div>
  );
}

function StakeholderCard({ icon, color, role, benefits }: {
  icon: React.ReactNode;
  color: string;
  role: string;
  benefits: { before: string; after: string }[];
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: color }}>
          {icon}
        </div>
        <h3 className="text-lg font-bold">{role}</h3>
      </div>
      <div className="space-y-2">
        {benefits.map((b, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[#c98d80] shrink-0">✕</span>
              <span className="text-[#a39ba1] line-through truncate">{b.before}</span>
            </div>
            <span className="text-[#c9a84c] shrink-0">→</span>
            <span className="text-[#2b232a] font-medium">{b.after}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIScenario({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <span className="font-bold text-sm">{title}</span>
      </div>
      <p className="text-xs text-[#675d66] leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureList({ items }: { items: { icon: React.ReactNode; text: string }[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2.5 text-sm">
          <div className="w-7 h-7 rounded-full bg-[#faf7f2] flex items-center justify-center shrink-0 text-[#675d66]">
            {item.icon}
          </div>
          {item.text}
        </li>
      ))}
    </ul>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="font-bold text-sm mb-1">Q: {q}</div>
      <div className="text-sm text-[#675d66]">A: {a}</div>
    </div>
  );
}
