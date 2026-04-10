// ═══════════════ NIGHTOS domain types ═══════════════

export type CustomerCategory = "vip" | "regular" | "new";

export interface Store {
  id: string;
  name: string;
}

export interface Cast {
  id: string;
  store_id: string;
  name: string;
  nomination_count: number;
  monthly_sales: number;
  repeat_rate: number; // 0..1
}

export interface Customer {
  id: string;
  store_id: string;
  cast_id: string;
  name: string;
  birthday: string | null; // YYYY-MM-DD
  job: string | null;
  favorite_drink: string | null;
  category: CustomerCategory;
  store_memo: string | null;
  created_at: string;
}

export interface CastMemo {
  id: string;
  customer_id: string;
  cast_id: string;
  last_topic: string | null;
  service_tips: string | null;
  next_topics: string | null;
  visit_notes: string | null;
  updated_at: string;
}

export interface Bottle {
  id: string;
  store_id: string;
  customer_id: string;
  brand: string;
  total_glasses: number;
  remaining_glasses: number;
  kept_at: string;
}

export interface Visit {
  id: string;
  store_id: string;
  customer_id: string;
  cast_id: string;
  table_name: string | null;
  is_nominated: boolean;
  visited_at: string;
}

export interface FollowLog {
  id: string;
  customer_id: string;
  cast_id: string;
  template_type: "thanks" | "invite" | "birthday" | "seasonal";
  sent_at: string;
}

export interface AiChat {
  id: string;
  cast_id: string;
  customer_id: string | null;
  messages: ChatMessage[];
  feedback: "helpful" | "not_helpful" | null;
  created_at: string;
}

// ═══════════════ Derived / view types ═══════════════

export type FollowReason =
  | "interval" // 来店間隔空き
  | "birthday" // 誕生日
  | "nomination_chance"; // 指名化チャンス

export interface FollowTarget {
  customer: Customer;
  reason: FollowReason;
  reasonLabel: string;
  reasonDetail: string;
  bottle?: Bottle;
  lastTopic?: string | null;
  daysSinceLastVisit: number;
  visitCount: number;
}

export interface CastHomeSummary {
  nominationCount: number;
  repeatRate: number; // 0..1
  followTargetCount: number;
  monthlySales: number;
}

export interface CastHomeData {
  cast: Cast;
  summary: CastHomeSummary;
  targets: FollowTarget[];
}

export interface CustomerContext {
  customer: Customer;
  memo: CastMemo | null;
  bottles: Bottle[];
  visits: Visit[];
}

// ═══════════════ Ruri-Mama chat types ═══════════════

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  // Present only on assistant messages when the backend stored a chatId
  id?: string;
  feedback?: "helpful" | "not_helpful" | null;
}

export type Intent = "follow" | "serving" | "strategy" | "freeform";

export interface HearingStep {
  id: string;
  question: string;
  options: string[];
}

export interface HearingFlow {
  intent: Intent;
  label: string;
  steps: HearingStep[];
}

export interface RuriMamaRequest {
  messages: ChatMessage[];
  customerId?: string;
  hearingContext?: Record<string, string>;
  castId: string;
  intent: Intent;
}

export interface RuriMamaResponse {
  reply: string;
}
