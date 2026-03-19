import type { BottleMenuItem } from "@/types";

export type BottleDetailData = BottleMenuItem & {
  total_glasses: number;
  order_instructions: string;
  delivery_time: string;
};

export const mockBottleDetails: Record<string, BottleDetailData> = {
  "d0000000-0000-0000-0000-000000000001": {
    id: "d0000000-0000-0000-0000-000000000001",
    name: "山崎 12年",
    image_url: "/images/bottles/yamazaki-12.jpg",
    remaining_glasses: 8,
    price_per_glass: 2800,
    owner_name: "田中様",
    is_popular: true,
    category: "シングルモルト",
    flavor_notes: ["バニラ", "オーク", "ドライフルーツ"],
    total_glasses: 20,
    order_instructions:
      "このボトルをご希望の場合は、スタッフにお声がけください。ハイボール、ストレート、オン・ザ・ロックなど、お好みのスタイルでご提供いたします。",
    delivery_time: "ご注文後、約3〜5分でご提供いたします",
  },
  "d0000000-0000-0000-0000-000000000003": {
    id: "d0000000-0000-0000-0000-000000000003",
    name: "響 ジャパニーズハーモニー",
    image_url: "/images/bottles/hibiki-harmony.jpg",
    remaining_glasses: 12,
    price_per_glass: 2500,
    owner_name: "佐藤様",
    is_popular: true,
    category: "ブレンデッド",
    flavor_notes: ["はちみつ", "オレンジピール", "ローズ"],
    total_glasses: 20,
    order_instructions:
      "このボトルをご希望の場合は、スタッフにお声がけください。ハイボール、ストレート、オン・ザ・ロックなど、お好みのスタイルでご提供いたします。",
    delivery_time: "ご注文後、約3〜5分でご提供いたします",
  },
  "d0000000-0000-0000-0000-000000000002": {
    id: "d0000000-0000-0000-0000-000000000002",
    name: "白州 12年",
    image_url: "/images/bottles/hakushu-12.jpg",
    remaining_glasses: 6,
    price_per_glass: 3200,
    owner_name: "田中様",
    is_popular: false,
    category: "シングルモルト",
    flavor_notes: ["ミント", "グリーンアップル", "スモーク"],
    total_glasses: 20,
    order_instructions:
      "このボトルをご希望の場合は、スタッフにお声がけください。ハイボール、ストレート、オン・ザ・ロックなど、お好みのスタイルでご提供いたします。",
    delivery_time: "ご注文後、約3〜5分でご提供いたします",
  },
  "d0000000-0000-0000-0000-000000000004": {
    id: "d0000000-0000-0000-0000-000000000004",
    name: "竹鶴 ピュアモルト",
    image_url: "/images/bottles/taketsuru-pm.jpg",
    remaining_glasses: 10,
    price_per_glass: 2200,
    owner_name: "佐藤様",
    is_popular: false,
    category: "ピュアモルト",
    flavor_notes: ["モルティ", "シトラス", "バニラ"],
    total_glasses: 20,
    order_instructions:
      "このボトルをご希望の場合は、スタッフにお声がけください。ハイボール、ストレート、オン・ザ・ロックなど、お好みのスタイルでご提供いたします。",
    delivery_time: "ご注文後、約3〜5分でご提供いたします",
  },
  "d0000000-0000-0000-0000-000000000005": {
    id: "d0000000-0000-0000-0000-000000000005",
    name: "知多 シングルグレーン",
    image_url: "/images/bottles/chita.jpg",
    remaining_glasses: 15,
    price_per_glass: 1600,
    owner_name: "佐藤様",
    is_popular: false,
    category: "グレーン",
    flavor_notes: ["ハニー", "ウッディ", "クリーン"],
    total_glasses: 20,
    order_instructions:
      "このボトルをご希望の場合は、スタッフにお声がけください。ハイボール、ストレート、オン・ザ・ロックなど、お好みのスタイルでご提供いたします。",
    delivery_time: "ご注文後、約3〜5分でご提供いたします",
  },
  "d0000000-0000-0000-0000-000000000006": {
    id: "d0000000-0000-0000-0000-000000000006",
    name: "ニッカ カフェグレーン",
    image_url: "/images/bottles/nikka-coffey-grain.jpg",
    remaining_glasses: 9,
    price_per_glass: 1800,
    owner_name: "佐藤様",
    is_popular: false,
    category: "グレーン",
    flavor_notes: ["バニラ", "トロピカル", "クリーミー"],
    total_glasses: 20,
    order_instructions:
      "このボトルをご希望の場合は、スタッフにお声がけください。ハイボール、ストレート、オン・ザ・ロックなど、お好みのスタイルでご提供いたします。",
    delivery_time: "ご注文後、約3〜5分でご提供いたします",
  },
};
