// ═══════════════ NIGHTOS domain types ═══════════════

import type { ClubRole, VenueType } from "@/lib/nightos/constants";

export type CustomerCategory = "vip" | "regular" | "new";

export interface Store {
  id: string;
  name: string;
  venue_type: VenueType;
}

export interface Cast {
  id: string;
  store_id: string;
  name: string;
  nomination_count: number;
  monthly_sales: number;
  repeat_rate: number; // 0..1
  /** Club only: role in the hierarchy */
  club_role?: ClubRole;
  /** Club only: the oneesan this help is assigned to */
  assigned_oneesan_id?: string;
}

// ═══════════════ Club-specific types ═══════════════

export interface Douhan {
  id: string;
  cast_id: string;
  customer_id: string;
  store_id: string;
  date: string; // YYYY-MM-DD
  status: "scheduled" | "completed" | "cancelled";
  note: string | null;
  created_at: string;
}

export interface DouhanSummary {
  monthlyCount: number;
  monthlyGoal: number;
  thisMonthDouhans: Douhan[];
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

// ═══════════════ LINE screenshot import ═══════════════

/**
 * Result of running a LINE screenshot through the vision model.
 * Each field is the SUGGESTED new value (or null if no update).
 */
export interface MemoExtractionResult {
  /** 1-2 sentence summary of what's in the screenshot. */
  summary: string;
  last_topic: string | null;
  service_tips: string | null;
  next_topics: string | null;
  /** Confidence the model has in its extraction. */
  confidence: "high" | "medium" | "low";
}

export interface LineScreenshot {
  id: string;
  customer_id: string;
  cast_id: string;
  /** Full data URL — `data:image/jpeg;base64,...` */
  image_data: string;
  media_type: string;
  extracted: MemoExtractionResult;
  /** Which extraction fields the cast actually applied. */
  applied_fields: ("last_topic" | "service_tips" | "next_topics")[];
  created_at: string;
}

// ═══════════════ Customer (来店客) app types ═══════════════

export type CouponType = "drink" | "discount" | "birthday" | "vip";

export interface Coupon {
  id: string;
  customer_id: string;
  store_id: string;
  store_name: string;
  type: CouponType;
  title: string;
  description: string;
  valid_from: string;
  valid_until: string;
  used_at: string | null;
  code: string;
}

export interface CustomerBottleView {
  bottle: Bottle;
  store_name: string;
  cast_name: string | null;
}

export interface CustomerStoreOverview {
  store_id: string;
  store_name: string;
  visit_count: number;
  total_spent_estimate: number;
  bottles: Bottle[];
  nomination_cast: string | null;
  nomination_cast_id: string | null;
  last_visit: string | null;
  coupons: Coupon[];
  rank: CustomerRank;
}

export type RankTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface CustomerRank {
  tier: RankTier;
  label: string;
  emoji: string;
  visitCount: number;
  nextTierLabel: string | null;
  visitsToNextTier: number;
  progress: number; // 0..1
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
  /** 今月の新規顧客数 */
  newCustomerCount: number;
  /** Club mode: 今月の同伴数 */
  douhanCount?: number;
  douhanGoal?: number;
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
  // True when this assistant reply came from the deterministic stub
  // (ANTHROPIC_API_KEY unset or Claude call errored out)
  isStub?: boolean;
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
  /**
   * Recent feedback samples from the cast (excerpted assistant content
   * that was marked helpful or not). Used to bias future replies.
   */
  recentFeedback?: {
    helpful: string[];
    notHelpful: string[];
  };
}

export interface RuriMamaResponse {
  reply: string;
  /** True when the reply came from the deterministic stub path. */
  isStub: boolean;
}
