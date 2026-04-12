import { ArrowRight, BarChart3, Bell, Calendar, Camera, CheckCircle2, Heart, MessageCircle, Sparkles, TrendingUp, Users, Wine, Zap } from "lucide-react";
import { PhoneFrame } from "./phone-frame";

export function Sections() {
  return (
    <>
      {/* ═══ COVER ═══ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-b from-[#f8f4ef] to-[#e8ddd0] print:break-after-page">
        <h1 className="text-6xl font-bold tracking-tight" style={{ fontFamily: '"Cormorant Garamond", serif' }}>NIGHTOS</h1>
        <div className="w-16 h-0.5 bg-[#c9a84c] my-5" />
        <p className="text-xl font-semibold text-center">店舗が入力するだけで、<br />キャストの売上が上がる</p>
        <p className="text-sm text-[#675d66] mt-2">夜のお店のための AI ワークスペース</p>
        <div className="flex gap-6 mt-10">
          <KPI value="80%" label="フォロー率" />
          <KPI value="+15%" label="リピート率改善" />
          <KPI value="5分/日" label="店舗の入力時間" />
        </div>
      </section>

      {/* ═══ CAST HOME SCREEN ═══ */}
      <section className="px-8 py-20 bg-white print:break-after-page">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge text="キャスト向け" />
            <h2 className="text-3xl font-bold mt-3 mb-4">今日やるべきことが<br />一目で分かる</h2>
            <p className="text-[#675d66] leading-relaxed mb-6">AIが来店パターンを分析し、「今日連絡すべき人」をフォロー理由付きで毎朝リストアップ。瑠璃ママからの朝のメッセージで、重点ポイントも把握。</p>
            <FeatureList items={["来店間隔・誕生日・指名化チャンスを自動判定", "フォロー対象に1タップでカルテ表示", "瑠璃ママAIの朝のブリーフィング"]} />
          </div>
          <PhoneFrame caption="キャスト ホーム画面">
            <MockCastHome />
          </PhoneFrame>
        </div>
      </section>

      {/* ═══ RURI-MAMA AI ═══ */}
      <section className="px-8 py-20 bg-[#faf7f2] print:break-after-page">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <PhoneFrame caption="瑠璃ママ AI チャット">
            <MockRuriMama />
          </PhoneFrame>
          <div>
            <Badge text="AI アドバイザー" />
            <h2 className="text-3xl font-bold mt-3 mb-4">銀座30年の経験者に<br />いつでも相談</h2>
            <p className="text-[#675d66] leading-relaxed mb-6">選択肢をタップするだけで、顧客情報を踏まえた具体的なアドバイスと LINE 文面例を提案。音声入力にも対応。</p>
            <FeatureList items={["アドバイス + 文面例 + なぜ効くか の3点セット", "選択式ヒアリング → タップだけで相談完了", "顧客カルテを自動参照して個別アドバイス"]} />
          </div>
        </div>
      </section>

      {/* ═══ CUSTOMER CARD ═══ */}
      <section className="px-8 py-20 bg-white print:break-after-page">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge text="顧客管理" />
            <h2 className="text-3xl font-bold mt-3 mb-4">お客様のすべてが<br />カルテに集約</h2>
            <p className="text-[#675d66] leading-relaxed mb-6">店舗が入力した情報もキャストの個人メモも、1画面で確認。来店履歴・ボトル残量・前回の話題まで、接客前に30秒で把握。</p>
            <FeatureList items={["店舗情報（閲覧のみ）と個人メモ（編集OK）を分離", "来店履歴・ボトル残量を時系列表示", "LINEスクショからメモを自動更新（AI読取）"]} />
          </div>
          <PhoneFrame caption="顧客カルテ">
            <MockCustomerCard />
          </PhoneFrame>
        </div>
      </section>

      {/* ═══ TEMPLATE ═══ */}
      <section className="px-8 py-20 bg-[#faf7f2] print:break-after-page">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <PhoneFrame caption="メッセージテンプレート">
            <MockTemplate />
          </PhoneFrame>
          <div>
            <Badge text="LINE 連絡" />
            <h2 className="text-3xl font-bold mt-3 mb-4">コピペ1回で<br />LINEが送れる</h2>
            <p className="text-[#675d66] leading-relaxed mb-6">お礼・お誘い・お祝い・季節の挨拶。顧客名・ボトル名・前回の話題が自動で挿入されたテンプレートをコピーしてLINEに貼るだけ。</p>
            <FeatureList items={["4カテゴリ×複数テンプレート", "瑠璃ママにその顧客専用の文面を生成してもらうことも", "コピー時にフォロー記録が自動保存"]} />
          </div>
        </div>
      </section>

      {/* ═══ STORE DASHBOARD ═══ */}
      <section className="px-8 py-20 bg-white print:break-after-page">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge text="店舗向け" />
            <h2 className="text-3xl font-bold mt-3 mb-4">数字で経営判断<br />できるダッシュボード</h2>
            <p className="text-[#675d66] leading-relaxed mb-6">指名数・リピート率の推移、キャスト別のフォロー率とARPU、離脱リスク顧客をすべて1画面に。</p>
            <FeatureList items={["キャスト別成績（指名・リピート・フォロー率・ARPU）", "離脱リスク顧客をAIが自動検知", "顧客カテゴリ構成（VIP/常連/新規の比率）"]} />
          </div>
          <PhoneFrame caption="店舗ダッシュボード">
            <MockDashboard />
          </PhoneFrame>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="px-8 py-20 bg-gradient-to-b from-[#faf7f2] to-white print:break-after-page">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">料金</h2>
          <div className="rounded-2xl bg-gradient-to-br from-[#f7f0de] to-[#f0e4cc] border border-[#c9a84c]/20 p-10">
            <div className="text-6xl font-bold" style={{ fontFamily: '"Cormorant Garamond", serif' }}>¥0</div>
            <div className="text-lg font-semibold mt-2">MVP 検証版 — 完全無料</div>
            <div className="text-sm text-[#675d66] mt-4 space-y-1">
              <p>✓ 全機能利用可能（AI込み）</p>
              <p>✓ 設備投資ゼロ（スマホだけ）</p>
              <p>✓ いつでも解約、データ削除OK</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="px-8 py-24 text-center bg-gradient-to-br from-[#9a7bbb]/10 to-[#c98d80]/10">
        <h2 className="text-3xl font-bold mb-3">まずはデモをご覧ください</h2>
        <p className="text-[#675d66] mb-8">スマホで実際に動くアプリをお見せします</p>
        <div className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-[#9a7bbb] to-[#c98d80] text-white font-semibold text-xl shadow-lg">
          デモを予約する <ArrowRight size={20} />
        </div>
      </section>
    </>
  );
}

// ═══════════════ Small components ═══════════════

function KPI({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold" style={{ fontFamily: '"Cormorant Garamond", serif' }}>{value}</div>
      <div className="text-xs text-[#675d66]">{label}</div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return <div className="inline-block px-3 py-1 rounded-full bg-[#9a7bbb]/10 text-[#9a7bbb] text-xs font-semibold">{text}</div>;
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ═══════════════ Phone screen mocks ═══════════════

function MockCastHome() {
  return (
    <div className="px-3">
      <div className="text-[11px] font-bold mb-1">おかえりなさい、あかり</div>
      <div className="flex gap-1.5 mb-2">
        <MiniStat label="指名" value="18" unit="本" color="#c98d80" />
        <MiniStat label="リピート" value="72" unit="%" color="#c98d80" />
        <MiniStat label="要フォロー" value="3" unit="人" color="#9a7bbb" />
      </div>
      <div className="rounded-lg bg-gradient-to-r from-[#9a7bbb] to-[#6e4f8f] text-white p-2.5 mb-2">
        <div className="text-[8px] opacity-80">✨ 今朝の瑠璃ママから</div>
        <div className="text-[9px] mt-1">あかりさん、おはよう🌸 今日は渡辺さんを最優先で。誕生日が近いから...</div>
      </div>
      <div className="text-[9px] font-bold mb-1">今日のフォロー対象</div>
      {[
        { name: "渡辺 浩二", reason: "🎂 誕生日間近", tag: "VIP" },
        { name: "田中 太郎", reason: "📅 来店間隔空き", tag: "VIP" },
        { name: "高橋 誠", reason: "✨ 指名化チャンス", tag: "新規" },
      ].map((c) => (
        <div key={c.name} className="rounded-lg border border-gray-100 p-2 mb-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold">{c.name}</span>
            <span className="text-[7px] px-1 py-0.5 rounded bg-[#c98d80]/10 text-[#c98d80]">{c.tag}</span>
          </div>
          <div className="text-[8px] text-[#9a7bbb]">{c.reason}</div>
        </div>
      ))}
    </div>
  );
}

function MockRuriMama() {
  return (
    <div className="px-3">
      <div className="rounded-t-lg bg-gradient-to-r from-[#9a7bbb] to-[#6e4f8f] text-white p-2 text-center">
        <div className="text-[10px] font-bold">瑠璃ママ</div>
        <div className="text-[7px] opacity-80">銀座30年の経験者</div>
      </div>
      <div className="mt-2 flex gap-1.5">
        <div className="w-5 h-5 rounded-full bg-[#c98d80] shrink-0" />
        <div className="rounded-lg bg-gray-50 border border-gray-100 p-2 text-[8px]">
          下から相談したいことを選んでね🌸
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        {["💬 LINEで連絡したい", "✨ 今、接客中で困っている", "📈 営業戦略の相談", "✏️ 自由に話す"].map((label) => (
          <div key={label} className="rounded-lg border border-[#9a7bbb]/20 bg-white p-2 flex items-center justify-between">
            <span className="text-[9px] font-medium">{label}</span>
            <span className="text-[8px] text-gray-400">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockCustomerCard() {
  return (
    <div className="px-3">
      <div className="text-[8px] text-[#9a7bbb] mb-1">← 顧客カルテ</div>
      <div className="flex items-center gap-1 mb-2">
        <span className="text-[12px] font-bold">田中 太郎</span>
        <span className="text-[7px] px-1 py-0.5 rounded bg-[#c98d80]/10 text-[#c98d80]">VIP</span>
      </div>
      <div className="flex gap-1.5 mb-2">
        <MiniStat label="来店" value="12" unit="回" />
        <MiniStat label="売上" value="480K" />
        <MiniStat label="指名率" value="100" unit="%" />
      </div>
      <div className="rounded-lg bg-[#f5ede0] p-2 mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] font-bold">店舗からの共有情報</span>
          <span className="text-[6px] px-1 py-0.5 rounded bg-[#d9c7a8] text-[#8a7a5a]">閲覧のみ</span>
        </div>
        <div className="text-[8px] text-[#675d66]">好み: 山崎12年ロック</div>
        <div className="text-[8px] text-[#675d66]">🍾 山崎12年 残8杯 / 白州12年 残6杯</div>
      </div>
      <div className="rounded-lg border-2 border-dashed border-[#e4a3b0] p-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] font-bold">個人メモ</span>
          <span className="text-[6px] px-1 py-0.5 rounded bg-[#f2c9d1] text-[#c57786]">編集OK</span>
        </div>
        <div className="text-[8px] text-[#675d66]">前回: 4月のゴルフ旅行の計画</div>
        <div className="text-[8px] text-[#675d66]">コツ: 最初は仕事の話から</div>
      </div>
    </div>
  );
}

function MockTemplate() {
  return (
    <div className="px-3">
      <div className="text-[11px] font-bold mb-1">メッセージテンプレート</div>
      <div className="flex gap-1 mb-2">
        {["お礼", "お誘い", "お祝い", "季節"].map((cat, i) => (
          <div key={cat} className={`flex-1 text-center py-1 rounded-full text-[8px] ${i === 0 ? "bg-gradient-to-r from-[#c98d80] to-[#a6695c] text-white" : "bg-gray-100 text-gray-500"}`}>{cat}</div>
        ))}
      </div>
      <div className="rounded-lg border border-gray-100 p-2 mb-2">
        <div className="text-[8px] font-medium text-[#9a7bbb] mb-1">瑠璃ママ提案 ✨</div>
        <div className="rounded bg-gray-50 p-1.5 text-[8px] text-[#2b232a]">
          「田中さん✨ 先日はありがとうございました。ゴルフ旅行の計画、その後うまく進んでますか？🌸 白州もまだ6杯残ってますよ。」
        </div>
        <div className="mt-1.5 rounded bg-[#c98d80] text-white text-center py-1.5 text-[8px] font-medium">コピーしてLINEへ</div>
      </div>
      <div className="rounded-lg border border-gray-100 p-2">
        <div className="text-[8px]"><span className="text-gray-400">親しみやすく</span></div>
        <div className="rounded bg-gray-50 p-1.5 text-[8px] mt-1">「田中さん、昨日はありがとうございました🌸 ゴルフ旅行のお話、本当に楽しかった...」</div>
      </div>
    </div>
  );
}

function MockDashboard() {
  return (
    <div className="px-3">
      <div className="text-[11px] font-bold mb-2">効果ダッシュボード</div>
      <div className="flex gap-1.5 mb-2">
        <MiniStat label="月間指名" value="32" unit="本" color="#c98d80" />
        <MiniStat label="月間売上" value="326" unit="万" />
      </div>
      <div className="rounded-lg border border-[#f59e0b]/20 bg-[#f59e0b]/5 p-2 mb-2">
        <div className="text-[8px] font-bold text-[#f59e0b]">⚠️ 離脱リスク顧客 — 3人</div>
        <div className="text-[7px] text-[#675d66] mt-1">山本隆(35日前) / 小林翔太(20日前)</div>
      </div>
      <div className="text-[8px] font-bold mb-1">指名数の推移</div>
      <div className="flex items-end gap-0.5 h-10 mb-2">
        {[3,2,1,2,0,2,3,2,1,0,2,1,3,2].map((v,i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#c98d80] to-[#d9a99e]" style={{height: `${(v/3)*100}%`}} />
        ))}
      </div>
      <div className="text-[8px] font-bold mb-1">キャスト別成績</div>
      <div className="text-[7px] space-y-1">
        <div className="flex justify-between"><span>📈 あかり</span><span>指名18 / リピ72% / ARPU¥460K</span></div>
        <div className="flex justify-between"><span>みさき</span><span>指名14 / リピ65% / ARPU¥355K</span></div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <div className="flex-1 rounded-lg bg-gray-50 border border-gray-100 p-1.5 text-center">
      <div className="text-[7px] text-gray-400">{label}</div>
      <div className="text-[12px] font-bold" style={{ color: color ?? "#2b232a", fontFamily: '"Cormorant Garamond", serif' }}>{value}<span className="text-[7px] text-gray-400">{unit}</span></div>
    </div>
  );
}
