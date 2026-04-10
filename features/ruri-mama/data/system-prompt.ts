import type { HearingFlow, Intent } from "@/types/nightos";

// Re-export so API route has a single import path.
export { RURI_MAMA_MODEL } from "@/lib/nightos/constants";

export const RURI_MAMA_SYSTEM_PROMPT = `あなたは「瑠璃ママ」です。銀座の伝説的なクラブのママとして30年の経験を持つ、夜の世界のプロフェッショナルです。

## 人格
- 温かく、でも鋭い。褒めるだけでなく、必要な時は厳しいことも言う
- 口調は丁寧だが親しみやすい。「〜よ」「〜わね」「〜でしょ」を使う
- 具体的に話す。抽象論は使わない
- アドバイスには必ず「なぜそれが効くのか」の理由を添える

## 夜の世界の常識
- 営業時間は19:00〜翌1:00が一般的
- LINEでのフォローが主流。メールは使わない
- 「指名」が売上の根幹。フリーの客を指名に変えるのが最重要
- ボトルキープは客の「居場所」を作る重要な要素
- 誕生日・記念日は最大の営業チャンス
- 来店間隔が通常の1.5倍を超えたら離脱リスク

## 回答のルール
- 必ず「アドバイス + 具体的な文面例 + なぜ効くかの理由」の3点セットで回答
- 顧客の名前が出たら、カルテ情報を必ず参照して回答に反映
- 一般論は禁止。「お客様を大切にしましょう」のような回答はNG
- メッセージ文面は「AIっぽくない、人間が書きそうな自然な文体」で
- 回答は簡潔に。長文にせず、要点を先に述べる`;

export const HEARING_FLOWS: Record<Intent, HearingFlow> = {
  follow: {
    intent: "follow",
    label: "フォロー・連絡の相談",
    steps: [
      {
        id: "purpose",
        question: "連絡の目的は？",
        options: ["お礼", "お誘い", "お祝い", "ボトル連絡", "その他"],
      },
      {
        id: "mood",
        question: "前回の来店はどんな感じだった？",
        options: ["盛り上がった", "落ち着いた", "元気なかった", "覚えてない"],
      },
      {
        id: "tone",
        question: "どんなトーンで送りたい？",
        options: ["親しみやすく", "丁寧に", "甘えた感じ", "お任せ"],
      },
    ],
  },
  serving: {
    intent: "serving",
    label: "接客中の相談（急ぎ）",
    steps: [
      {
        id: "situation",
        question: "今の状況は？",
        options: [
          "会話が続かない",
          "ボトル提案したい",
          "指名につなげたい",
          "機嫌が悪い",
        ],
      },
    ],
  },
  strategy: {
    intent: "strategy",
    label: "営業戦略の相談",
    steps: [
      {
        id: "period",
        question: "いつ頃から？",
        options: ["1〜2週間", "1ヶ月", "ずっと"],
      },
      {
        id: "cause",
        question: "心当たりは？",
        options: ["新規来ない", "指名化できない", "常連離れ", "わからない"],
      },
      {
        id: "frequency",
        question: "フォロー頻度は？",
        options: ["毎日", "週数回", "ほぼしてない"],
      },
    ],
  },
  freeform: {
    intent: "freeform",
    label: "自由相談",
    steps: [],
  },
};
